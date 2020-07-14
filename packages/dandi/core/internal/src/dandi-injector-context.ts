import { CUSTOM_INSPECTOR, Disposable, isConstructor } from '@dandi/common'
import {
  getInjectionScopeName,
  getRestrictedScope,
  getScopeBehavior,
  getScopeRestriction,
  scopesAreCompatible,
} from '@dandi/core/internal/util'
import {
  DependencyInjectionScope,
  InjectionScope,
  InjectionToken,
  InjectorContext,
  Provider,
  Registerable,
  RegistrationSource,
  ScopeRestriction,
  ScopeBehavior,
} from '@dandi/core/types'

import { DandiResolverContext } from './dandi-resolver-context'
import { Repository, RepositoryEntry } from './repository'
import { AppInjectionScope, RootInjectionScope } from './root-injection-scope'

export interface FindExecFnData<T> {
  result: FindCacheEntry<T>
  injectorContext: DandiInjectorContext
}
export type FindExecFn<T, TResult> = (data: FindExecFnData<T>) => TResult

export interface FindCacheEntry<T> {
  context: DandiInjectorContext
  entry: RepositoryEntry<T>
}

let instanceId = 0

/**
 * A scope object containing references to the repository and perInjector contexts used to resolve an injection token to a
 * provider and access instances.
 */
export class DandiInjectorContext implements InjectorContext, Disposable {

  public readonly instanceId: string

  protected readonly repository: Repository
  protected readonly injectorSource: RegistrationSource

  private readonly instanceRequests = new Map<Provider<any>, Promise<any>>()
  private readonly findCache = new Map<InjectionToken<any>, FindCacheEntry<any>>()

  public constructor(
    public readonly parent: DandiInjectorContext,
    public readonly scope: InjectionScope,
    providers: Registerable[] = [],
  ) {
    if (!scope) {
      throw new Error('scope is required')
    }

    this.injectorSource = {
      constructor: this.constructor,
      tag: '.ctr',
    }
    if (parent) {
      this.repository = parent.repository.getChild(scope)
      this.instanceId = `${this.parent.instanceId}.${instanceId++}`
    } else {
      this.repository = Repository.for(scope)
      this.instanceId = (instanceId++).toString()
    }
    this.repository.register(this.injectorSource, {
      provide: InjectorContext,
      useValue: this,
    })
    if (scope instanceof DependencyInjectionScope) {
      this.repository.register(this.injectorSource, {
        provide: InjectionScope,
        useValue: isConstructor(scope.target) ? scope.target : scope,
      })
    }
    this.registerInternal(providers)
  }

  // FIXME: change the exec overload to be named differently so it can be private/protected?
  public find<T>(token: InjectionToken<T>): DandiResolverContext<T>
  public find<T, TResult>(token: InjectionToken<T>, exec: FindExecFn<T, TResult>): TResult
  public find<T, TResult>(token: InjectionToken<T>, exec?: FindExecFn<T, TResult>): TResult | DandiResolverContext<T> {
    const result = this.cachedFind(token, this)
    if (!result) {
      return undefined
    }
    if (exec) {
      return exec({ result, injectorContext: this })
    }
    return new DandiResolverContext(token, result.entry, result.context, this)
  }

  public addInstance<T>(provider: Provider<T>, value: T): T {
    return this.withInstanceContext(provider, instanceContext => {
      instanceContext.repository.addInstance(provider.provide, value)
      return value
    })
  }

  public getInstance<T>(provider: Provider<T>): T {
    return this.withInstanceContext(provider, instanceContext => {
      return instanceContext?.repository.getInstance(provider)
    })
  }

  public getInstanceRequest<T>(provider: Provider<T>): Promise<T> {
    return this.withInstanceContext(provider, instanceContext => {
      const existingInstance = instanceContext.repository.getInstance<T>(provider)
      if (existingInstance) {
        return Promise.resolve(existingInstance)
      }
      return instanceContext.instanceRequests.get(provider)
    })
  }

  public async setInstanceRequest<T>(provider: Provider<T>, value: Promise<T>): Promise<T> {
    return await this.withInstanceContext(provider, async instanceContext => {
      const existingInstance = instanceContext.repository.getInstance<T>(provider)
      if (existingInstance) {
        return existingInstance
      }
      const existingRequest = instanceContext.instanceRequests.get(provider)
      if (existingRequest) {
        return await existingRequest
      }
      instanceContext.instanceRequests.set(provider, value)
      let result
      try {
        result = await value
        instanceContext.repository.addInstance(provider.provide, result)
        return result
      } finally {
        instanceContext.instanceRequests.delete(provider)
      }
    })
  }

  public createChild(scope: InjectionScope, ...providers: Registerable[]): DandiInjectorContext {
    return new DandiInjectorContext(this, scope, providers)
  }

  public findInstanceContext(matchContext: InjectorContext, scopeRestriction?: ScopeRestriction): DandiInjectorContext {
    // allowInstances should never be false here in practice - it is only false for the GLOBAL_SCOPE repository, which
    // is only used by the AmbientInjectableScanner to manage its discovered injectables. It is not used as the
    // repository instance for an InjectorContext instance.
    if (!this.repository.allowInstances) {
      return undefined
    }

    if (scopeRestriction) {

      const scopeBehavior = getScopeBehavior(scopeRestriction)
      if (scopeBehavior === ScopeBehavior.perInjector) {
        return this
      }

      const restrictedToScope = getRestrictedScope(scopeRestriction)
      if (scopesAreCompatible(this.scope, restrictedToScope)) {
        return this
      }

    } else if (matchContext === this) {
      return this
    }

    return this.parent?.findInstanceContext(matchContext, scopeRestriction)
  }

  public [CUSTOM_INSPECTOR](): string {
    const parts = [getInjectionScopeName(this.scope)]
    if (this.parent && !(this.parent.scope instanceof AppInjectionScope) && !(this.parent.scope instanceof RootInjectionScope)) {
      parts.push(this.parent[CUSTOM_INSPECTOR]())
    }
    return parts.join('\nresolving ')
  }

  public async dispose(reason: string): Promise<void> {
    Disposable.markDisposing(this, reason)
    this.findCache.clear()
    // note: other injector contexts created for the same injectable/same scope will have the same repository reference,
    // so the additional checking logic of Disposable.dispose is required to avoid attempting to dispose the same
    // repository twice
    await Disposable.dispose(this.repository, `Disposed owner InjectorContext: ${reason}`)
    Disposable.remapDisposed(this, reason)
  }

  protected withInstanceContext<T, TResult>(
    provider: Provider<T>,
    exec: (instanceContext: DandiInjectorContext) => TResult,
  ): TResult {
    return this.find(provider.provide, (data) => {
      const scope = getScopeRestriction(provider)
      const instanceContext = data.injectorContext.findInstanceContext(data.result.context, scope)
      return exec(instanceContext)
    })
  }

  protected registerInternal(registerable: Registerable[], source?: RegistrationSource): this {
    registerable.forEach(entry => {
      if (Array.isArray(entry)) {
        this.registerInternal(entry)
        return
      }

      this.repository.register(source || this.injectorSource, entry)
    })
    return this
  }

  protected doFind<T>(token: InjectionToken<T>, entryContext: InjectorContext): FindCacheEntry<T> {
    const entry = this.repository.get(token)
    if (entry && !this.isSkipped(entry, entryContext)) {
      return {
        context: this,
        entry,
      } as FindCacheEntry<T>
    }

    if (this.parent) {
      return this.parent.cachedFind(token, entryContext)
    }

    return undefined
  }

  private isSkipped(entry: RepositoryEntry<any>, entryContext: InjectorContext): boolean {
    if (this !== entryContext) {
      return false
    }
    if (entry instanceof Set) {
      const [first] = entry
      return !!first.parentsOnly
    }
    return !!entry.parentsOnly
  }

  protected cachedFind<T>(token: InjectionToken<T>, entryContext: InjectorContext): FindCacheEntry<T> {
    const cacheResult = this.findCache.get(token)
    if (cacheResult) {
      return cacheResult
    }

    const cacheEntry = this.doFind(token, entryContext)
    this.findCache.set(token, cacheEntry)
    return cacheEntry as FindCacheEntry<T>
  }
}

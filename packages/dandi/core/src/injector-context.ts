import { CUSTOM_INSPECTOR, Disposable, isConstructor } from '@dandi/common'

import { getInjectionScopeName } from './injection-scope-util'
import { InjectionScope, DependencyInjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'
import { Repository, RepositoryEntry } from './repository'
import { Registerable } from './module'
import { RepositoryRegistrationSource } from './repository-registration'

export type FindExecFn<T, TResult> = (repo: Repository, entry: RepositoryEntry<T>) => TResult

export interface FindCacheEntry<T> {
  repo: Repository
  entry: RepositoryEntry<T>
}

/**
 * A scope object containing references to the repository and parent contexts used to resolve an injection token to a
 * provider and access singleton instances.
 */
export class InjectorContext implements Disposable {

  public get injectionScope(): InjectionScope {
    return this.scope
  }

  protected readonly repository: Repository
  protected readonly injectorSource: RepositoryRegistrationSource

  private readonly findCache = new Map<InjectionToken<any>, FindCacheEntry<any>>()

  public constructor(
    public readonly parent: InjectorContext,
    public readonly scope: InjectionScope,
    providers: Registerable[] = [],
  ) {
    if (!this.scope) {
      throw new Error('scope is required')
    }

    this.injectorSource = {
      constructor: this.constructor,
      tag: '.ctr',
    }
    this.repository = Repository.for(this)
    this.repository.register(this.injectorSource, {
      provide: InjectorContext,
      useValue: this,
    })
    if (this.scope instanceof DependencyInjectionScope) {
      this.repository.register(this.injectorSource, {
        provide: InjectionScope,
        useValue: isConstructor(this.scope.target) ? this.scope.target : this.scope,
      })
    }
    // this.repository.register(this.injectorSource, {
    //   provide: InjectionScope,
    //   useValue: scope,
    // })
    this.registerInternal(providers)
  }

  protected registerInternal(registerable: Registerable[], source?: RepositoryRegistrationSource): this {
    registerable.forEach(entry => {
      if (Array.isArray(entry)) {
        this.registerInternal(entry)
        return
      }

      this.repository.register(source || this.injectorSource, entry)
    })
    return this
  }

  public find<T>(token: InjectionToken<T>): RepositoryEntry<T>
  public find<T, TResult>(token: InjectionToken<T>, exec: FindExecFn<T, TResult>): TResult
  public find<T, TResult>(token: InjectionToken<T>, exec?: FindExecFn<T, TResult>): TResult | RepositoryEntry<T> {
    const result = this.cachedFind(token, this)
    if (!result) {
      return undefined
    }
    if (exec) {
      return exec(result.repo, result.entry as RepositoryEntry<T>)
    }
    return result.entry as RepositoryEntry<T>
  }

  public addSingleton<T>(provider: Provider<T>, value: T): T {
    return this.find(provider.provide, (repo) => {
      const singletonRepo = repo.allowSingletons ? repo : this.findSingletonRepo(repo)
      singletonRepo.addSingleton(provider, value)
      return value
    })
  }

  public getSingleton<T>(provider: Provider<T>): T {
    return this.find(provider.provide, (repo) => {
      const singletonRepo = repo.allowSingletons ? repo : this.findSingletonRepo(repo)
      return singletonRepo.getSingleton(provider)
    })
  }

  public async dispose(reason: string): Promise<void> {
    this.findCache.clear()
    await this.repository.dispose(`Disposed owner InjectorContext: ${reason}`)
    Disposable.remapDisposed(this, reason)
  }

  public createChild(
    reason: InjectionScope,
    ...providers: Registerable[]
  ): InjectorContext {
    return new InjectorContext(this, reason, providers)
  }

  public [CUSTOM_INSPECTOR](): string {
    const parts = [this.getCustomInspectorString()]
    if (this.parent) {
      parts.push(this.parent[CUSTOM_INSPECTOR]())
    }
    return parts.reverse().join(' -> ')
  }

  protected getCustomInspectorString(): string {
    if (!this.scope) {
      return '???'
    }

    return getInjectionScopeName(this.scope)
  }

  protected doFind<T>(token: InjectionToken<T>, entryContext: InjectorContext): FindCacheEntry<T> {
    const entry = this.repository.get(token)
    if (entry && !this.isSkipped(entry, entryContext)) {
      return {
        repo: this.repository,
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
      if (!entry.size) {
        return false
      }
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

  protected findSingletonRepo(fromRepo: Repository): Repository {
    if (this.parent) {
      const fromParent = this.parent.findSingletonRepo(fromRepo)
      if (fromParent) {
        return fromParent
      }
    }
    if (this.repository.allowSingletons) {
      return this.repository
    }
  }
}

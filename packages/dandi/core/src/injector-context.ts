import { Constructor, CUSTOM_INSPECTOR, Disposable, isConstructor } from '@dandi/common'

import { InjectionContext, DependencyInjectionContext } from './injection-context'
import { getInjectionContextName } from './injection-context-util'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'
import { Repository, RepositoryEntry } from './repository'
import { ResolverContext } from './resolver-context'
import { ResolverContextConstructor } from './resolver-context-constructor'

export type FindExecFn<T, TResult> = (repo: Repository, entry: RepositoryEntry<T>) => TResult

export interface FindCacheEntry<T> {
  repo: Repository
  entry: RepositoryEntry<T>
}

/**
 * A context object containing references to the set of repositories used to resolve an injection token to a provider.
 */
export class InjectorContext implements Disposable {

  public get injectionContext(): InjectionContext {
    return this.context
  }

  protected readonly repository: Repository
  protected readonly injectorSource

  private readonly children: Array<InjectorContext> = []
  private readonly findCache = new Map<InjectionToken<any>, FindCacheEntry<any>>()

  public constructor(
    public readonly parent: InjectorContext,
    public readonly context: InjectionContext,
    providers: Array<Provider<any> | Constructor<any>> = [],
  ) {

    if (!this.context) {
      throw new Error('context is required')
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
    if (this.context instanceof DependencyInjectionContext) {
      this.repository.register(this.injectorSource, {
        provide: InjectionContext,
        useValue: isConstructor(this.context.target) ? this.context.target : this.context,
      })
    }
    providers.forEach((provider) => this.repository.register(this.injectorSource, provider))
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

  public dispose(reason: string): void {
    this.children.forEach((child) => {
      if (!Disposable.isDisposed(child)) {
        child.dispose(`Disposing parent ResolverContext: ${reason}`)
      }
    })
    this.children.length = 0
    this.findCache.clear()
    this.repository.dispose(`Disposed owner ResolverContext: ${reason}`)
    Disposable.remapDisposed(this, reason)
  }

  public createChild(
    injectionContext: InjectionContext,
    ...providers: Provider<any>[]
  ): InjectorContext {

    const cloned = new InjectorContext(this, injectionContext, providers)
    this.children.push(cloned)
    return cloned
  }

  public createResolverContext<T>(
    ctr: ResolverContextConstructor<T>,
    token: InjectionToken<T>,
    injectionContext: InjectionContext,
    ...providers: Array<Provider<any> | Constructor<any>>
  ): ResolverContext<T> {

    const cloned = new ctr(token, this, injectionContext, providers)
    this.children.push(cloned)
    return cloned
  }

  protected getCustomInspectorString(): string {
    if (!this.context) {
      return '???'
    }

    return getInjectionContextName(this.context)
  }

  public [CUSTOM_INSPECTOR](): string {
    const parts = [this.getCustomInspectorString()]
    if (this.parent) {
      parts.push(this.parent[CUSTOM_INSPECTOR]())
    }
    return parts.reverse().join(' -> ')
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
      return !![...entry][0].parentsOnly
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

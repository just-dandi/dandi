import { Constructor, CUSTOM_INSPECTOR, Disposable, isConstructor } from '@dandi/common'

import { InjectionContext, DependencyInjectionContext } from './injection-context'
import { getInjectionContextName } from './injection-context-util'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'
import { Repository, RepositoryEntry } from './repository'
import { ResolverContext } from './resolver-context'
import { ResolverContextConstructor } from './resolver-context-constructor'

/**
 * @internal
 * @ignore
 */
export type FindExecFn<T, TResult> = (repo: Repository, entry: RepositoryEntry<T>) => TResult

/**
 * @internal
 * @ignore
 */
export interface FindCacheEntry<T> {
  repo: Repository
  entry: RepositoryEntry<T>
}

/**
 * A context object containing references to the set of available {@see Provider} objects used to resolve an
 * {@see InjectionToken} to its configured {@see Provider}.
 */
export class InjectorContext implements Disposable {

  /**
   * Returns the {@see InjectionContext} object specified when creating the {@see InjectorContext}.
   */
  public get injectionContext(): InjectionContext {
    return this.context
  }

  protected readonly repository: Repository
  protected readonly injectorSource

  private readonly children: Array<InjectorContext> = []
  private readonly findCache = new Map<InjectionToken<any>, FindCacheEntry<any>>()

  /**
   * @param parent The `InjectorContext` used to generate the previous level of the `InjectorContext` hierarchy
   * @param context The reason the `InjectorContext` is being instantiated
   * @param providers
   */
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

  /**
   * @internal
   * Attempts to find a {@see RepositoryEntry} for the specified `token`.
   * @param token The {@see InjectionToken} to search for
   */
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

  /**
   * @internal
   * Adds a singleton instance for the specified `provider` to the deepest possible {@see InjectorContext} in the hierarchy.
   *
   * Most, if not all singletons should end up being stored in the {@see Injector}'s root {@see InjectorContext}
   * @param provider
   * @param value
   */
  public addSingleton<T>(provider: Provider<T>, value: T): T {
    return this.find(provider.provide, (repo) => {
      const singletonRepo = repo.allowSingletons ? repo : this.findSingletonRepo(repo)
      singletonRepo.addSingleton(provider, value)
      return value
    })
  }

  /**
   * @internal
   * Attempts to find a singleton instance for the specified `provider`.
   * @param provider
   */
  public getSingleton<T>(provider: Provider<T>): T {
    return this.find(provider.provide, (repo) => {
      const singletonRepo = repo.allowSingletons ? repo : this.findSingletonRepo(repo)
      return singletonRepo.getSingleton(provider)
    })
  }

  /**
   * Disposes of any child {@see InjectorContext} instances, as well as the {@see Repository} instance.
   * @param reason A brief description of why the object is being disposed
   */
  public async dispose(reason: string): Promise<void> {
    await Promise.all(this.children.map((child) => {
      if (!Disposable.isDisposed(child)) {
        return child.dispose(`Disposing parent ResolverContext: ${reason}`)
      }
    }))
    this.children.length = 0
    this.findCache.clear()
    await this.repository.dispose(`Disposed owner ResolverContext: ${reason}`)
    Disposable.remapDisposed(this, reason)
  }

  /**
   * @internal
   * Creates child {@see InjectorContext} using the specified `injectionContext` and additional providers.
   * @param injectionContext The {@see InjectionContext}
   * @param providers Any additional {@see Provider} values that can be used to resolve tokens in the child {@see InjectorContext}
   */
  public createChild(
    injectionContext: InjectionContext,
    ...providers: Provider<any>[]
  ): InjectorContext {

    const cloned = new InjectorContext(this, injectionContext, providers)
    this.children.push(cloned)
    return cloned
  }

  /**
   * @internal
   * Creates a {@see ResolverContext} instance that can be used by {@see Injector} instances to resolve and inject dependencies
   * @param ctr The constructor to use for creating the {@see ResolverContext} instance
   * @param token The {@see InjectionToken} that the {@see ResolverContext} instance is being created to resolve
   * @param injectionContext
   * @param providers Any additional {@see Provider} values that can be used to resolve tokens in the {@see ResolverContext}
   */
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

  /**
   * @internal
   * Gets a string representation of the {@see InjectionContext}.
   */
  protected getCustomInspectorString(): string {
    if (!this.context) {
      return '???'
    }

    return getInjectionContextName(this.context)
  }

  /**
   * Generates an injection stack from the hierarchy of {@see InjectorContext} instances.
   */
  public [CUSTOM_INSPECTOR](): string {
    const parts = [this.getCustomInspectorString()]
    if (this.parent) {
      parts.push(this.parent[CUSTOM_INSPECTOR]())
    }
    return parts.reverse().join(' -> ')
  }

  /**
   * @internal
   * @ignore
   */
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

  /**
   * @internal
   * @ignore
   */
  protected cachedFind<T>(token: InjectionToken<T>, entryContext: InjectorContext): FindCacheEntry<T> {
    const cacheResult = this.findCache.get(token)
    if (cacheResult) {
      return cacheResult
    }

    const cacheEntry = this.doFind(token, entryContext)
    this.findCache.set(token, cacheEntry)
    return cacheEntry as FindCacheEntry<T>
  }

  /**
   * @internal
   * @ignore
   */
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
}

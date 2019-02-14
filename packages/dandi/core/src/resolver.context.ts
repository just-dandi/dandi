import * as util from 'util'

import { Disposable, Constructor } from '@dandi/common'

import { InjectionContext } from './injection.context'
import { getInjectionContext, getInjectionContextName } from './injection.context.util'
import { InjectionToken, getTokenString } from './injection.token'
import { Provider } from './provider'
import { isProvider } from './provider.util'
import { Repository, RepositoryEntry } from './repository'
import { ResolveResult } from './resolve.result'

export type FindExecFn<T, TResult> = (repo: Repository, entry: RepositoryEntry<T>) => TResult

export interface FindCacheEntry<T> {
  repo: Repository
  entry: RepositoryEntry<T>
}

/**
 * A context object containing references to the set of repositories used to resolve an injection token to a provider.
 */
export class ResolverContext<T> implements Disposable {
  public get match(): RepositoryEntry<T> {
    if (!this._match) {
      this._match = this.find(this.target)
    }
    return this._match
  }

  public get result(): ResolveResult<T> {
    return this._result
  }

  public get injectionContext(): InjectionContext {
    if (!this.parent) {
      return function RootInjectionContext() {}
    }

    return this.parent.context || getInjectionContext(this.parent.match as any) || this.context
  }

  private readonly children: Array<ResolverContext<any>> = [];
  private readonly instances: any[] = [];
  private readonly findCache = new Map<InjectionToken<any>, FindCacheEntry<any>>();
  private readonly contextRepository: Repository;

  private _match: RepositoryEntry<T>;

  private _result: ResolveResult<T>;

  public constructor(
    public readonly target: InjectionToken<T>,
    private readonly repositories: Repository[],
    public readonly parent: ResolverContext<T>,
    public readonly context: InjectionContext,
    providers: Array<Provider<any>> = [],
  ) {
    this.contextRepository = Repository.for(this)
    this.contextRepository.register({
      provide: ResolverContext,
      useValue: this,
    })
    if (this.parent) {
      this.contextRepository.register({
        provide: InjectionContext,
        useValue: parent.injectionContext,
      })
    }
    providers.forEach((provider) => this.contextRepository.register(provider))
    this.repositories.unshift(this.contextRepository)
  }

  public addInstance(obj: T): T {
    this.instances.push(obj)
    return obj
  }

  public find<T>(token: InjectionToken<T>): RepositoryEntry<T>
  public find<T, TResult>(token: InjectionToken<T>, exec: FindExecFn<T, TResult>): TResult
  public find<T, TResult>(token: InjectionToken<T>, exec?: FindExecFn<T, TResult>): TResult | RepositoryEntry<T> {
    const result = this.cachedFind(token)
    if (!result) {
      return null
    }
    if (exec) {
      return exec(result.repo, result.entry as RepositoryEntry<T>)
    }
    return result.entry as RepositoryEntry<T>
  }

  public addSingleton(provider: Provider<T>, value: T): T {
    return this.find(provider.provide, (repo) => {
      const singletonRepo = repo.allowSingletons ? repo : this.findSingletonRepo(repo)
      singletonRepo.addSingleton(provider, value)
      return value
    })
  }

  public getSingleton(provider: Provider<T>): T {
    return this.find(provider.provide, (repo) => {
      const singletonRepo = repo.allowSingletons ? repo : this.findSingletonRepo(repo)
      return singletonRepo.getSingleton(provider)
    })
  }

  public resolveValue(result: T | T[]): ResolveResult<T> {
    this._result = new ResolveResult<T>(this, result)
    return this._result
  }

  public dispose(reason: string): void {
    this.instances.forEach((instance) => {
      if (Disposable.isDisposable(instance)) {
        instance.dispose(`Disposing ResolverContext: ${reason}`)
      }
    })
    this.instances.length = 0
    this.children.forEach((child) => {
      if (!Disposable.isDisposed(child)) {
        child.dispose(`Disposing parent ResolverContext: ${reason}`)
      }
    })
    this.children.length = 0
    this.findCache.clear()
    this.repositories.length = 0
    this.contextRepository.dispose(`Disposed owner ResolverContext: ${reason}`)
    Disposable.remapDisposed(this, reason)
  }

  public childContext(
    token: InjectionToken<T>,
    context: InjectionContext,
    ...providersOrRepositories: Array<Provider<any> | Repository>
  ): ResolverContext<T> {
    const providers = providersOrRepositories.filter(isProvider)
    const repositories = providersOrRepositories.filter((entry) => entry instanceof Repository) as Repository[]

    const cloned = new (this.constructor as Constructor<ResolverContext<T>>)(token, repositories, this, context, providers)
    this.children.push(cloned)
    return cloned
  }

  public [util.inspect.custom](): string {
    const thisContext = this.context || getInjectionContext(this.match as any)
    const parts = [(getInjectionContextName(thisContext)) || getTokenString(this.target)]
    if (this.parent) {
      parts.push(this.parent[util.inspect.custom]())
    }
    return parts.reverse().join(' -> ')
  }

  protected doFind<T>(token: InjectionToken<T>): FindCacheEntry<T> {
    for (const repo of this.repositories) {
      const entry = repo.get(token)
      if (entry) {
        return {
          repo,
          entry,
        } as FindCacheEntry<T>
      }
    }

    if (this.parent) {
      return this.parent.cachedFind(token)
    }

    return null
  }

  protected cachedFind<T>(token: InjectionToken<T>): FindCacheEntry<T> {
    const cacheResult = this.findCache.get(token)
    if (cacheResult) {
      return cacheResult
    }

    const cacheEntry = this.doFind(token)
    this.findCache.set(token, cacheEntry)
    return cacheEntry as FindCacheEntry<T>
  }

  private findSingletonRepo(fromRepo: Repository): Repository {
    if (this.parent) {
      const fromParent = this.parent.findSingletonRepo(fromRepo)
      if (fromParent) {
        return fromParent
      }
    }
    if (!this.repositories.length) {
      return undefined
    }
    const repos = this.repositories.slice(0).reverse()
    const availableRepos = repos.slice(repos.indexOf(fromRepo) + 1)
    return availableRepos.find((repo) => repo.allowSingletons)
  }
}

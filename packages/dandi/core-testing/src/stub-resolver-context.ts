import { isConstructor } from '@dandi/common'
import {
  FindCacheEntry,
  InjectionContext,
  InjectionToken,
  Provider,
  Repository,
  RepositoryEntry,
  ResolverContext,
} from '@dandi/core'

import { stubProvider } from './stub-provider'

export class StubResolverContext<T> extends ResolverContext<T> {

  constructor(
    target: InjectionToken<T>,
    repositories: Repository[],
    parent: ResolverContext<T>,
    context: InjectionContext,
    providers: Array<Provider<any>> = [],
  ) {
    super(target, repositories, parent, context, providers)
  }

  protected doFind<T>(token: InjectionToken<T>): FindCacheEntry<T> {
    const result = super.doFind(token)
    if (result) {
      return result
    }

    if (isConstructor(token)) {
      return {
        entry: stubProvider(token) as RepositoryEntry<T>,
        repo: { allowSingletons: false } as any,
      }
    }

    return result

  }

  protected findSingletonRepo(fromRepo: Repository): Repository {
    const baseResult = super.findSingletonRepo(fromRepo)
    if (baseResult) {
      return baseResult
    }
  }

}

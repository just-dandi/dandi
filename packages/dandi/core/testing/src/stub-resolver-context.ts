import { isConstructor } from '@dandi/common'
import {
  FindCacheEntry,
  InjectionContext,
  InjectionToken,
  InjectorContext,
  Provider,
  Repository,
  RepositoryEntry,
  ResolverContext,
} from '@dandi/core'

import { stubProvider } from './stub-provider'

const stubProviders = new Map<InjectionToken<any>, RepositoryEntry<any>>()

export class StubResolverContext<T> extends ResolverContext<T> {

  constructor(
    target: InjectionToken<T>,
    parent: InjectorContext,
    context: InjectionContext,
    providers: Array<Provider<any>> = [],
  ) {
    super(target, parent, context, providers)
  }

  protected doFind<T>(token: InjectionToken<T>, entryContext: InjectorContext): FindCacheEntry<T> {
    const result = super.doFind(token, entryContext)
    if (result) {
      return result
    }

    if (isConstructor(token)) {
      let provider = stubProviders.get(token)
      if (!provider) {
        provider = stubProvider(token)
        stubProviders.set(token, provider)
      }
      return {
        entry: provider,
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

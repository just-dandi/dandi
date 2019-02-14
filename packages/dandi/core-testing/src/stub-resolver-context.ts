import { isConstructor } from '@dandi/common'
import { InjectionContext, InjectionToken, Provider, Repository, RepositoryEntry, ResolverContext } from '@dandi/core'

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

  public get match(): RepositoryEntry<T> {
    const result = super.match
    if (result) {
      return result
    }

    if (isConstructor(this.target)) {
      return stubProvider(this.target) as RepositoryEntry<T>
    }

    return result

  }

}

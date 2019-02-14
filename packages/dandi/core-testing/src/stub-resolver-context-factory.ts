import {
  Injectable,
  ResolverContext,
  InjectionToken,
  Repository,
  ResolverContextFactory, InjectionContext, Singleton,
} from '@dandi/core'

import { StubResolverContext } from './stub-resolver-context'

@Injectable(ResolverContextFactory, Singleton)
export class StubResolverContextFactory extends ResolverContextFactory {
  public create<T>(
    token: InjectionToken<T>,
    context?: InjectionContext,
    ...repositories: Repository[]
  ): ResolverContext<T> {
    repositories.reverse()
    return new StubResolverContext(token, repositories, null, context)
  }
}

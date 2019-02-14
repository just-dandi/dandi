import { Injectable, Singleton } from './injectable.decorator'
import { InjectionToken } from './injection.token'
import { InjectionContext } from './injection.context'
import { Repository } from './repository'
import { ResolverContext } from './resolver.context'

@Injectable(Singleton)
export class ResolverContextFactory {

  public create<T>(
    token: InjectionToken<T>,
    context?: InjectionContext,
    ...repositories: Repository[]
  ): ResolverContext<T> {
    repositories.reverse()
    return new ResolverContext(token, repositories, null, context)
  }

}

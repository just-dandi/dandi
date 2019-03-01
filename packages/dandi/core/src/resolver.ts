import { InjectionToken } from './injection.token'
import { localOpinionatedToken } from './local.token'
import { Repository } from './repository'
import { ResolveResult } from './resolve.result'
import { ResolverContext } from './resolver.context'

export interface Resolver {

  /**
   * Performs a shallow check (not checking dependencies or other parameters) to see if a matching provider
   * has been configured for the specified injection token.
   * @param token - the injection token
   * @param repositories - any additional {Repository} instances to use for resolving the token
   */
  canResolve(token: InjectionToken<any>, ...repositories: Repository[]): boolean

  invoke(instance: object, member: Function, ...repositories: Repository[]): Promise<any>;

  invokeInContext(
    context: ResolverContext<any>,
    instance: object,
    member: Function,
    ...repositories: Repository[]
  ): Promise<any>;

  resolve<T>(token: InjectionToken<T>, optional?: boolean, ...repositories: Repository[]): Promise<ResolveResult<T>>;

  resolveInContext<T>(
    context: ResolverContext<any>,
    token: InjectionToken<T>,
    optional?: boolean,
    ...repositories: Repository[]
  ): Promise<ResolveResult<T>>;
}

export const Resolver = localOpinionatedToken<Resolver>('Resolver', {
  multi: false,
  singleton: true,
})

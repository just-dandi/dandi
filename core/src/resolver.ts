import { InjectionToken } from './injection.token';
import { localOpinionatedToken } from './local.token';
import { Repository } from './repository';
import { ResolveResult } from './resolve.result';
import { ResolverContext } from './resolver.context';

export interface Resolver {
  invoke(instance: any, member: Function, ...repositories: Repository[]): Promise<any>;

  invokeInContext(
    context: ResolverContext<any>,
    instance: any,
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
});

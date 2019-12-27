import { InjectionToken } from './injection-token'
import { InjectorContext } from './injector-context'
import { localOpinionatedToken } from './local-token'
import { ResolverContext } from './resolver-context'

export interface ResolverContextConstructor<T> {
  new (
    target: InjectionToken<T>,
    injectorContext: InjectorContext,
  ): ResolverContext<T>
}

export const ResolverContextConstructor: InjectionToken<ResolverContextConstructor<any>> =
  localOpinionatedToken('ResolverContextConstructor', {
    multi: false,
    singleton: true,
  })

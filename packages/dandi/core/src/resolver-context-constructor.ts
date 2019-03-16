import { Constructor } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { InjectorContext } from './injector-context'
import { InjectionContext } from './injection-context'
import { Provider } from './provider'
import { ResolverContext } from './resolver-context'
import { localOpinionatedToken } from './local-token'

/**
 * @internal
 * @ignore
 */
export interface ResolverContextConstructor<T> {
  new (
    target: InjectionToken<T>,
    parentInjectorContext: InjectorContext,
    injectionContext: InjectionContext,
    providers?: Array<Provider<any> | Constructor<any>>,
  ): ResolverContext<T>
}

/**
 * @internal
 * @ignore
 */
export const ResolverContextConstructor: InjectionToken<ResolverContextConstructor<any>> =
  localOpinionatedToken('ResolverContextConstructor', {
    multi: false,
    singleton: true,
  })

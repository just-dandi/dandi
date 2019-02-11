import { Constructor } from '@dandi/common'

import { InjectionToken } from './injection.token'
import { localOpinionatedToken } from './local.token'

/**
 * Stores a reference to the object (and for invocations, the method) that requested an injection dependency.
 */
export interface MethodInjectionContext {
  instance: object
  method: Function
}

export type InjectionContext = Constructor<any> | Function | MethodInjectionContext | string

export const InjectionContext: InjectionToken<InjectionContext> = localOpinionatedToken<InjectionContext>(
  'InjectionContext',
  {
    multi: false,
    singleton: false,
  },
)

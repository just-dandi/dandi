import { Constructor } from '@dandi/common'

import { InjectionToken } from './injection.token'
import { localOpinionatedToken } from './local.token'

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

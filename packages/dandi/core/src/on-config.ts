import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

/**
 * A function that is called once before the `bootstrap` application lifecycle event
 */
export type OnConfig = (...args: any[]) => void

export const OnConfig: InjectionToken<OnConfig> = localOpinionatedToken('OnConfig', {
  multi: true,
})

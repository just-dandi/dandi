import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

export type OnConfig = (...args: any[]) => void

export const OnConfig: InjectionToken<OnConfig> = localOpinionatedToken('OnConfig', {
  multi: true,
})

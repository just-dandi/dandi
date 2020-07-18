import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'

export type OnConfig = (...args: any[]) => void

export const OnConfig: InjectionToken<OnConfig> = localToken.opinionated('OnConfig', {
  multi: true,
})

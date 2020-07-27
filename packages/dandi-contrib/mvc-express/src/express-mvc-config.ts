import { InjectionToken } from '@dandi/core'

import { localToken } from './local-token'

export interface ExpressMvcConfig {
  port: number
}

export const ExpressMvcConfig: InjectionToken<ExpressMvcConfig> = localToken.opinionated<ExpressMvcConfig>(
  '@dandi/mvc:ExpressMvcConfig',
  {
    multi: false,
  },
)

import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export type NowFn = () => number

export const Now: InjectionToken<NowFn> = localOpinionatedToken('Now', {
  multi: false,
})

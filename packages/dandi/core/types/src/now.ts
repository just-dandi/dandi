import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'

export type NowFn = () => number

export const Now: InjectionToken<NowFn> = localToken.opinionated('Now', {
  multi: false,
})

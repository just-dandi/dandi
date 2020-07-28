import { localToken } from '../../src/local-token'

export type NowFn = () => number

export const Now = localToken.opinionated<NowFn>('Now', {
  multi: false,
})

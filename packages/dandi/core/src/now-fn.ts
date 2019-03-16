import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

/**
 * A function that generates a timestamp for the current time
 */
export type NowFn = () => number

export const NowFn: InjectionToken<NowFn> = localOpinionatedToken('Now', {
  multi: false,
})

import { OnConfig } from './on-config'
import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

/**
 * @internal
 * @ignore
 */
export const OnConfigInternal: InjectionToken<OnConfig> = localOpinionatedToken('OnConfigInternal', {
  multi: true,
})

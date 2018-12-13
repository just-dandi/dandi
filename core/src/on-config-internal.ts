import { OnConfig } from '@dandi/core'

import { InjectionToken } from './injection.token'
import { localOpinionatedToken } from './local.token'

export const OnConfigInternal: InjectionToken<OnConfig> = localOpinionatedToken('OnConfigInternal', {
  multi: true,
})

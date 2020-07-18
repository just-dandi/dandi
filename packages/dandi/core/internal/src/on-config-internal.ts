import { InjectionToken, OnConfig } from '@dandi/core/types'

import { localToken } from '../../src/local-token'

export const OnConfigInternal: InjectionToken<OnConfig> = localToken.opinionated('OnConfigInternal', {
  multi: true,
})

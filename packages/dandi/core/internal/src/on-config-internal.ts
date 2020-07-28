import { OnConfig } from '@dandi/core/types'

import { localToken } from '../../src/local-token'

export const OnConfigInternal = localToken.opinionated<OnConfig>('OnConfigInternal', {
  multi: true,
})

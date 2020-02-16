import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export interface CacheKeyGenerator {
  keyFor(...args: any[]): symbol
}

export const CacheKeyGenerator: InjectionToken<CacheKeyGenerator> = localOpinionatedToken<CacheKeyGenerator>(
  'CacheKeyGenerator',
  {
    multi: false,
  },
)

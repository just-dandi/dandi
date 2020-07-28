import { localToken } from './local-token'

export interface CacheKeyGenerator {
  keyFor(...args: any[]): symbol
}

export const CacheKeyGenerator = localToken.opinionated<CacheKeyGenerator>('CacheKeyGenerator', {
  multi: false,
})

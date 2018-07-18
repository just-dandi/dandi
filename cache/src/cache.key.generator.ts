import { InjectionToken } from '@dandi/di-core';

import { localOpinionatedToken } from './local.token';

export interface CacheKeyGenerator {
    keyFor(...args: any[]): Symbol;
}

export const CacheKeyGenerator: InjectionToken<CacheKeyGenerator> =
    localOpinionatedToken<CacheKeyGenerator>('CacheKeyGenerator', { multi: false });

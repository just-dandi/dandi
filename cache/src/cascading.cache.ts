import { Duration }                     from '@dandi/common';
import { Inject, Injectable, Optional } from '@dandi/core';

import { Cache, CacheProvider, CacheProviderType } from './cache.provider';

@Injectable(CacheProvider(CacheProviderType.cascading))
export class CascadingCache implements Cache {

    private readonly caches: Cache[];
    private local: Cache;

    constructor(
        @Inject(CacheProvider(CacheProviderType.localMemory)) @Optional() localMem: Cache,
        @Inject(CacheProvider(CacheProviderType.localService)) @Optional() localSvc: Cache,
        @Inject(CacheProvider(CacheProviderType.network)) @Optional() network: Cache,
        @Inject(CacheProvider(CacheProviderType.remote)) @Optional() remote: Cache,
    ) {
        this.caches = [
            localMem,
            localSvc,
            network,
            remote
        ].filter(cache => cache);
        this.local = this.caches[0];
    }

    public async get<T>(key: Symbol): Promise<T> {
        for (let cache of this.caches) {
            let result = await cache.get(key);
            if (result) {
                return result as T;
            }
        }
    }

    public async set(key: any, value: any, duration?: Duration): Promise<void> {
        return await this.local.set(key, value, duration);
    }

    public async delete(key: any): Promise<boolean> {
        return await this.local.delete(key);
    }

}

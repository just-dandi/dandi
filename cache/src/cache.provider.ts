import { Duration } from '@dandi/core';
import { MappedInjectionToken } from '@dandi/di-core';

import { localOpinionatedToken } from './local.token';

export enum CacheProviderType {
    cascading = 'cascading',
    localMemory = 'localMemory',
    localService = 'localService',
    network = 'networkCache',
    remote = 'remoteCache',
}

export interface Cache {

    get<T>(key: Symbol): Promise<T>;
    set(key: Symbol, value: any, duration?: Duration): Promise<void>;
    delete(key: Symbol): Promise<boolean>;

}

const tokens = new Map<CacheProviderType, MappedInjectionToken<CacheProviderType, Cache>>();

export const Cache = CacheProvider(CacheProviderType.cascading);

export function CacheProvider(type: CacheProviderType) {
    let token: MappedInjectionToken<CacheProviderType, Cache> = tokens.get(type);
    if (!token) {
        token = {
            provide: localOpinionatedToken<Cache>(`CacheProvider:${type}`, { multi: false }),
            key: type,
        };
        tokens.set(type, token);
    }
    return token;
}


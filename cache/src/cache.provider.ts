import { Duration } from '@dandi/common';
import { MappedInjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';

export enum CacheProviderType {
  cascading = 'cascading',
  localMemory = 'localMemory',
  localService = 'localService',
  network = 'networkCache',
  remote = 'remoteCache',
}

export interface Cache {
  get<T>(key: symbol): Promise<T>;

  set(key: symbol, value: any, duration?: Duration): Promise<void>;

  delete(key: symbol): Promise<boolean>;
}

const tokens = new Map<
  CacheProviderType,
  MappedInjectionToken<CacheProviderType, Cache>
>();

export const Cache = CacheProvider(CacheProviderType.cascading);

export function CacheProvider(type: CacheProviderType) {
  let token: MappedInjectionToken<CacheProviderType, Cache> = tokens.get(type);
  if (!token) {
    token = {
      provide: localOpinionatedToken<Cache>(`CacheProvider:${type}`, {
        multi: false,
      }),
      key: type,
    };
    tokens.set(type, token);
  }
  return token;
}

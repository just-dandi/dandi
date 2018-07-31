import { Provider } from '@dandi/core';

import { SyncConfigClient } from './config.client';
import { configProvider } from './config.provider';
import { ConfigToken } from './config.token';

export class EnvConfigClient implements SyncConfigClient {
  public static provider<T>(token: ConfigToken<T>): Provider<T> {
    return configProvider(EnvConfigClient, token);
  }

  public readonly async: false = false;
  public readonly allowsEncryption = false;

  public get(token: ConfigToken<any>): string {
    return process.env[token.key];
  }
}

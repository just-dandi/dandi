import { ConfigClientStatic, isConfigClientStatic } from '@dandi/config'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { SentryClient } from './sentry-client'
import { SentryConfigProvider } from './sentry-config'
import { SentryCredentials } from './sentry-credentials'
import { SentryOnConfig } from './sentry-on-config'
import { SentryOptions } from './sentry-options'
import { SentryScopeDataProvider } from './sentry-scope-data'
import { SentryStaticProvider } from './sentry-static'

export class SentryModuleBuilder extends ModuleBuilder<SentryModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SentryModuleBuilder, localToken.PKG, entries)
  }

  public credentials(configClient: ConfigClientStatic, key: string): this {
    return this.add(configClient.provider(SentryCredentials.configToken(key)))
  }

  public config(config: SentryOptions): this
  public config(configClient: ConfigClientStatic, key: string, encrypted?: boolean): this
  public config(
    configOrConfigClient: SentryOptions | ConfigClientStatic,
    key?: string,
    encrypted: boolean = true,
  ): this {
    if (isConfigClientStatic(configOrConfigClient)) {
      return this.add(configOrConfigClient.provider(SentryCredentials.configToken(key, encrypted)))
    }
    return this.add({
      provide: SentryOptions,
      useValue: configOrConfigClient,
    })
  }
}

export const SentryModule = new SentryModuleBuilder(
  SentryClient,
  SentryConfigProvider,
  SentryOnConfig,
  SentryScopeDataProvider,
  SentryStaticProvider,
  {
    provide: SentryOptions,
    useValue: {},
  },
)

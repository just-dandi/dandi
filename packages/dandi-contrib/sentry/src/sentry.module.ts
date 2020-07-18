import { ConfigClientStatic } from '@dandi/config'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { SentryClient } from './sentry-client'
import { SentryConfig } from './sentry-config'
import { SentryOnConfig } from './sentry-on-config'

export class SentryModuleBuilder extends ModuleBuilder<SentryModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SentryModuleBuilder, localToken.PKG, entries)
  }

  public config(config: SentryConfig): this
  public config(configClient: ConfigClientStatic, key: string): this
  public config(configOrConfigClient: SentryConfig | ConfigClientStatic, key?: string): this {
    if (configOrConfigClient instanceof SentryConfig) {
      return this.add({
        provide: SentryConfig,
        useValue: configOrConfigClient,
      })
    }

    return this.add(configOrConfigClient.provider(SentryConfig.configToken(key)))
  }
}

export const SentryModule = new SentryModuleBuilder(SentryOnConfig, SentryClient)

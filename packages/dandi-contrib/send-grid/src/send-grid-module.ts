import { ConfigClientStatic } from '@dandi/config'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { SendGridClient } from './send-grid-client'
import { SendGridConfig } from './send-grid-config'

export class SendGridModuleBuilder extends ModuleBuilder<SendGridModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SendGridModuleBuilder, localToken.PKG, entries)
  }

  public config(config: SendGridConfig): this
  public config(configClient: ConfigClientStatic, key: string): this
  public config(configOrConfigClient: SendGridConfig | ConfigClientStatic, key?: string): this {
    if (configOrConfigClient instanceof SendGridConfig) {
      return this.add({
        provide: SendGridConfig,
        useValue: configOrConfigClient,
      })
    }

    return this.add(configOrConfigClient.provider(SendGridConfig.configToken(key)))
  }
}

export const SendGridModule = new SendGridModuleBuilder(SendGridClient)

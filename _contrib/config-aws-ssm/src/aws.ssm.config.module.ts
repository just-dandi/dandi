import { ModuleBuilder, Registerable } from '@dandi/core'

import { AwsSsmClientProvider } from './ssm.client.factory'
import { PKG } from './local.token'

export class ConfigAwsSsmModuleBuilder extends ModuleBuilder<ConfigAwsSsmModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ConfigAwsSsmModuleBuilder, PKG, ...entries)
  }
}

export const ConfigAwsSsmModule = new ConfigAwsSsmModuleBuilder(AwsSsmClientProvider)

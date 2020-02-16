import { ModuleBuilder, Registerable } from '@dandi/core'

import { PKG } from './local.token'
import { AwsSsmClientProvider } from './ssm.client.factory'

export class ConfigAwsSsmModuleBuilder extends ModuleBuilder<ConfigAwsSsmModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ConfigAwsSsmModuleBuilder, PKG, ...entries)
  }
}

export const ConfigAwsSsmModule = new ConfigAwsSsmModuleBuilder(AwsSsmClientProvider)

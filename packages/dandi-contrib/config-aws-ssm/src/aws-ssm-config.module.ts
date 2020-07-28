import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { AwsSsmClientProvider } from './ssm-client-factory'

export class ConfigAwsSsmModuleBuilder extends ModuleBuilder<ConfigAwsSsmModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ConfigAwsSsmModuleBuilder, localToken.PKG, entries)
  }
}

export const ConfigAwsSsmModule = new ConfigAwsSsmModuleBuilder(AwsSsmClientProvider)

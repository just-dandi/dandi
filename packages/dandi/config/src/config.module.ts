import { ModuleBuilder, Registerable } from '@dandi/core'

import { EnvConfigClient } from './env-config-client'
import { localToken } from './local-token'
import { NodeEnvProvider } from './node-env'

export class ConfigModuleBuilder extends ModuleBuilder<ConfigModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ConfigModuleBuilder, localToken.PKG, entries)
  }
}

export const ConfigModule = new ConfigModuleBuilder(EnvConfigClient, NodeEnvProvider)

import { ModuleBuilder, Registerable } from '@dandi/core'

import { ConfigResolver } from './config-resolver'
import { EnvConfigClient } from './env-config-client'
import { localToken } from './local-token'

export class ConfigModuleBuilder extends ModuleBuilder<ConfigModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ConfigModuleBuilder, localToken.PKG, ...entries)
  }
}

export const ConfigModule = new ConfigModuleBuilder(
  ConfigResolver,
  EnvConfigClient,
)

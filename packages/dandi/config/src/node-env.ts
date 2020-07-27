import { InjectionToken, Provider } from '@dandi/core'

import { EnvConfigClient } from './env-config-client'
import { localToken } from './local-token'

export type NodeEnv = string

export const NodeEnv: InjectionToken<string> = localToken.opinionated<string>('NodeEnv', {
  multi: false,
})

export const NodeEnvProvider: Provider<String> = EnvConfigClient.provider({
  type: String,
  provide: NodeEnv,
  key: 'NODE_ENV',
  encrypted: false,
})

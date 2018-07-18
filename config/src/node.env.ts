import { InjectionToken, Provider } from '@dandi/di-core';

import { EnvConfigClient }       from './env.config.client';
import { localOpinionatedToken } from './local.token';

export type NodeEnv = string;

export const NodeEnv: InjectionToken<string> = localOpinionatedToken('NodeEnv', {
    multi:     false,
    singleton: true,
});

export const NodeEnvProvider: Provider<String> = EnvConfigClient.provider({
    type:      String,
    provide:   NodeEnv,
    key:       'NODE_ENV',
    encrypted: false,
});

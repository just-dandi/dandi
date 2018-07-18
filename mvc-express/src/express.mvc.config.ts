import { InjectionToken } from '@dandi/di-core';

import { localOpinionatedToken } from './local.token';

export interface ExpressMvcConfig {
    port: number;
}

export const ExpressMvcConfig: InjectionToken<ExpressMvcConfig> =
    localOpinionatedToken<ExpressMvcConfig>('@dandi/mvc:ExpressMvcConfig', { multi: false });

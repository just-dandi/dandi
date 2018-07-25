import { InjectionToken, Provider } from '@dandi/core';

import { localOpinionatedToken } from './local.token';

export interface RequestProviderRegistrar {
    provide(...args: any[]): Promise<Provider<any>[]>;
}

export const RequestProviderRegistrar: InjectionToken<RequestProviderRegistrar> =
    localOpinionatedToken<RequestProviderRegistrar>('RequestProviderRegistrar', {
        multi: true,
    });

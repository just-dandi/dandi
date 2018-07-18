import { InjectionToken, Provider } from '@dandi/di-core';
import { SSM } from 'aws-sdk';

import { localOpinionatedToken } from './local.token';

export function ssmClientFactory() {
    return new SSM();
}

export type AwsSsmClient = SSM;

export const AwsSsmClient: InjectionToken<AwsSsmClient> =
    localOpinionatedToken('AwsSsmClient', { singleton: true, multi: false });

export const AwsSsmClientProvider: Provider<AwsSsmClient> = {
    provide:    AwsSsmClient,
    useFactory: ssmClientFactory,
};

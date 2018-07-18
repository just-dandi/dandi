import { Provider } from '@dandi/di-core';

import { AwsSsmClientProvider } from './ssm.client.factory';

export const AwsSsmConfigModule: Provider<any>[] = [
    AwsSsmClientProvider,
];

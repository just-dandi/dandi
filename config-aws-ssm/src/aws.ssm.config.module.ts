import { Provider } from '@dandi/core';

import { AwsSsmClientProvider } from './ssm.client.factory';

export const AwsSsmConfigModule: Provider<any>[] = [
    AwsSsmClientProvider,
];

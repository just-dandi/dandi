import { Provider } from '@dandi/core';

import { AwsSsmClientProvider } from './ssm.client.factory';

export const AwsSsmConfigModule: Array<Provider<any>> = [AwsSsmClientProvider];

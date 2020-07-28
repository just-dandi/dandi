import { Provider } from '@dandi/core'
import { SSM } from 'aws-sdk'

import { localToken } from './local-token'

export function ssmClientFactory(): AwsSsmClient {
  return new SSM()
}

export type AwsSsmClient = SSM

export const AwsSsmClient = localToken.opinionated<AwsSsmClient>('AwsSsmClient', {
  multi: false,
})

export const AwsSsmClientProvider: Provider<AwsSsmClient> = {
  provide: AwsSsmClient,
  useFactory: ssmClientFactory,
}

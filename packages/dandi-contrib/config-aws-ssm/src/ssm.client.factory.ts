import { InjectionToken, Provider } from '@dandi/core'
import { SSM } from 'aws-sdk'

import { localOpinionatedToken } from './local.token'

export function ssmClientFactory(): AwsSsmClient {
  return new SSM()
}

export type AwsSsmClient = SSM

export const AwsSsmClient: InjectionToken<AwsSsmClient> = localOpinionatedToken('AwsSsmClient', {
  multi: false,
})

export const AwsSsmClientProvider: Provider<AwsSsmClient> = {
  provide: AwsSsmClient,
  useFactory: ssmClientFactory,
}

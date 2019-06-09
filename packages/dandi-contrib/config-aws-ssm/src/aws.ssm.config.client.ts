import { AsyncConfigClient, ConfigToken, configProvider } from '@dandi/config'
import { Inject, Injectable, Provider } from '@dandi/core'

import { SsmClient } from './ssm.client'

@Injectable()
export class AwsSsmConfigClient implements AsyncConfigClient {
  public static provider<T>(token: ConfigToken<T>): Provider<T> {
    return configProvider(AwsSsmConfigClient, token)
  }

  public readonly async: true = true
  public readonly allowsEncryption = true

  constructor(@Inject(SsmClient) private ssm: SsmClient) {}

  public get<T>(token: ConfigToken<T>): Promise<string> {
    return this.ssm.getParameter(token.key, token.encrypted)
  }
}

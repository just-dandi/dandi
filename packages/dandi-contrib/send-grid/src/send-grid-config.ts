import { ConfigToken } from '@dandi/config'
import { Property, Required } from '@dandi/model'

export class SendGridConfig {
  public static configToken(key: string): ConfigToken<SendGridConfig> {
    return {
      type: SendGridConfig,
      key,
      encrypted: true,
    }
  }

  @Required()
  @Property(String)
  public apiKey: string
}

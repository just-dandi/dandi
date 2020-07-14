import { ConfigToken } from '@dandi/config'
import { Property, Required } from '@dandi/model'

export class SentryConfig {
  public static configToken(key: string): ConfigToken<SentryConfig> {
    return {
      type: SentryConfig,
      key,
      encrypted: true,
    }
  }

  @Required()
  @Property(String)
  public dsn: string
}

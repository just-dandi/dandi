import { ConfigToken } from '@dandi/config'
import { Property, Required } from '@dandi/model'

export class SentryCredentials {
  public static configToken(key: string, encrypted: boolean = true): ConfigToken<SentryCredentials> {
    return {
      type: SentryCredentials,
      key,
      encrypted,
    }
  }

  @Required()
  @Property(String)
  public dsn: string
}

import { ConfigToken } from '@dandi/config'
import { ModelBase, Property, Required } from '@dandi/model'

export class DbUserCredentials extends ModelBase {
  public static configToken(key: string, encrypted: boolean = true): ConfigToken<DbUserCredentials> {
    return {
      key,
      type: DbUserCredentials,
      encrypted,
    }
  }

  @Property(String)
  @Required()
  public username: string

  @Property(String)
  @Required()
  public password: string

  constructor(source?: any) {
    super(source)
  }
}

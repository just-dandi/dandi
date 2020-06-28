import { ConfigToken } from '@dandi/config'
import { ModelBase, Property } from '@dandi/model'

export class DbConnectionInfo extends ModelBase {
  public static configToken(key: string, encrypted: boolean = true): ConfigToken<DbConnectionInfo> {
    return {
      key,
      type: DbConnectionInfo,
      encrypted,
    }
  }

  @Property(Number)
  public port: number

  @Property(String)
  public host: string

  @Property(String)
  public database: string

  constructor(source?: any) {
    super(source)
  }
}

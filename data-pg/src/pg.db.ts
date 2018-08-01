import { Constructor } from '@dandi/common';
import { Provider } from '@dandi/core';
import { CamelSnakeDataMapper } from '@dandi/data';

import { PgDbClient, PgDbPool, PgDbPoolConfig, PgDbTransactionClient, POOL_CLIENT_PROVIDER } from '../index';

export class PgDb {
  public static defaults(): Array<Provider<any> | Constructor<any>> {
    return [
      CamelSnakeDataMapper,
      PgDbPool,
      PgDbPoolConfig,
      PgDbClient,
      PgDbTransactionClient,
      POOL_CLIENT_PROVIDER,
    ] as Array<Provider<any> | Constructor<any>>;
  }
}

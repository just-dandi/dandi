import { Constructor }          from '@dandi/common';
import { CamelSnakeDataMapper } from '@dandi/data';
import { Provider }             from '@dandi/core';

import {
    PgDbClient, PgDbPool, PgDbPoolConfig, PgDbTransactionClient, POOL_CLIENT_PROVIDER,
} from '../index';

export class PgDb {
    public static defaults(): (Provider<any> | Constructor<any>)[] {
        return [
            CamelSnakeDataMapper,
            PgDbPool,
            PgDbPoolConfig,
            PgDbClient,
            PgDbTransactionClient,
            POOL_CLIENT_PROVIDER,
        ] as (Provider<any> | Constructor<any>)[];
    }
}

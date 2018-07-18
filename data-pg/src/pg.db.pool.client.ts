import { Disposable }               from '@dandi/core';
import { InjectionToken, Provider } from '@dandi/di-core';

import { PoolClient } from 'pg';

import { localOpinionatedToken } from './local.token';
import { PgDbPool }              from './pg.db.pool';
import { PgDbQueryableClient }   from './pg.db.queryable';

export interface PgDbPoolClient extends Disposable, PgDbQueryableClient {
}

export const PgDbPoolClient: InjectionToken<PgDbPoolClient> =
    localOpinionatedToken('PgDbPoolClient', { multi: false, singleton: false });

export async function poolClientFactory(pool: PgDbPool): Promise<PgDbPoolClient> {
    const client = await pool.connect();
    if (Disposable.isDisposable(client)) {
        return client;
    }
    return Disposable.makeDisposable<PoolClient>(client, () => client.release());
}

export const POOL_CLIENT_PROVIDER: Provider<PgDbPoolClient> = {
    provide: PgDbPoolClient,
    useFactory: poolClientFactory,
    deps: [PgDbPool],
    async: true,
};

import { Disposable }                              from '@dandi/common';
import { Inject, Injectable, Resolver, Singleton } from '@dandi/core';

import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

import { PgDbConfig }            from './pg.db.config';
import { PgDbQueryableClient }   from './pg.db.queryable';

@Injectable(Singleton)
export class PgDbPool implements Disposable, PgDbQueryableClient {

    private pool: Pool;

    constructor(
        @Inject(PgDbConfig) config: PoolConfig,
        @Inject(Resolver) private resolver: Resolver,
    ) {
        this.pool = new Pool(config);
    }

    public async connect(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    public async dispose(): Promise<void> {
        await this.pool.end();
        this.pool = null;
        Disposable.remapDisposed(this, 'disposed');
    }

    public query(cmd: string, args: any[]): Promise<QueryResult> {
        return this.pool.query(cmd, args);
    }

}

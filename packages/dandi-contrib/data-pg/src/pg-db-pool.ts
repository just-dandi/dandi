import { Disposable } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg'

import { PgDbConfig } from './pg-db-pool-config'
import { PgDbQueryableClient } from './pg-db-queryable'

@Injectable()
export class PgDbPool implements Disposable, PgDbQueryableClient {
  private pool: Pool

  constructor(@Inject(PgDbConfig) config: PoolConfig) {
    this.pool = new Pool(config)
  }

  public connect(): Promise<PoolClient> {
    return this.pool.connect()
  }

  public query(cmd: string, args: any[]): Promise<QueryResult> {
    return this.pool.query(cmd, args)
  }

  public async dispose(reason: string): Promise<void> {
    await this.pool.end()
    this.pool = undefined
    Disposable.remapDisposed(this, reason)
  }
}

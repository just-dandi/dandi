import { Disposable } from '@dandi/common'
import { Provider, ScopeBehavior } from '@dandi/core'
import { PoolClient, QueryResult } from 'pg'

import { PgDbPool } from './pg-db-pool'
import { PgDbQueryableClient } from './pg-db-queryable'

export class PgDbPoolClient implements Disposable, PgDbQueryableClient {

  private disposed = false

  constructor(private readonly client: PoolClient) {}

  public query(cmd: string, args: any[]): Promise<QueryResult> {
    return this.client.query(cmd, args)
  }

  public dispose(): void | Promise<void> {
    if (this.disposed) {
      return
    }
    this.disposed = true
    this.client.release()
  }
}

export async function poolClientFactory(pool: PgDbPool): Promise<PgDbPoolClient> {
  return new PgDbPoolClient(await pool.connect())
}

export const POOL_CLIENT_PROVIDER: Provider<PgDbPoolClient> = {
  provide: PgDbPoolClient,
  useFactory: poolClientFactory,
  deps: [PgDbPool],
  async: true,
  restrictScope: ScopeBehavior.perInjector,
}

import { ModuleBuilder, Registerable } from '@dandi/core';

import { PKG } from './local.token';
import { PgDbPool } from './pg.db.pool';
import { PgDbPoolConfig } from './pg.db.config';
import { PgDbClient } from './pg.db.client';
import { POOL_CLIENT_PROVIDER } from './pg.db.pool.client';
import { PgDbTransactionClient } from './pg.db.transaction.client';

export class DataPgModuleBuilder extends ModuleBuilder<DataPgModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(DataPgModuleBuilder, PKG, ...entries);
  }
}

export const DataPgModule = new DataPgModuleBuilder(
  PgDbPool,
  PgDbPoolConfig,
  PgDbClient,
  PgDbTransactionClient,
  POOL_CLIENT_PROVIDER,
);

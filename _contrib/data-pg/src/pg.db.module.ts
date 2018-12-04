import { PgDbPool } from './pg.db.pool';
import { PgDbPoolConfig } from './pg.db.config';
import { PgDbClient } from './pg.db.client';
import { POOL_CLIENT_PROVIDER } from './pg.db.pool.client';
import { PgDbTransactionClient } from './pg.db.transaction.client';

export const PgDbModule = [PgDbPool, PgDbPoolConfig, PgDbClient, PgDbTransactionClient, POOL_CLIENT_PROVIDER];

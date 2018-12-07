import { InjectionToken } from '@dandi/core'

import { DbQueryable } from './db.queryable'
import { DbTransactionClient } from './db.transaction.client'
import { localOpinionatedToken } from './local.token'

export type TransactionFn<T> = (client: DbTransactionClient) => Promise<T>

export interface DbClient extends DbQueryable {
  transaction<T>(transactionFn: TransactionFn<T>): Promise<T>;
}

export const DbClient: InjectionToken<DbClient> = localOpinionatedToken<DbClient>('DbClient', { singleton: false })

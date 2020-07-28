import { DbQueryable } from './db.queryable'
import { DbTransactionClient } from './db.transaction.client'
import { localToken } from './local-token'

export type TransactionFn<T> = (client: DbTransactionClient) => Promise<T>

export interface DbClient extends DbQueryable {
  transaction<T>(transactionFn: TransactionFn<T>): Promise<T>
}

export const DbClient = localToken.symbol<DbClient>('DbClient')

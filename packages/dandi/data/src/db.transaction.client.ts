import { Disposable } from '@dandi/common'

import { DbTransactionScope } from './db-transaction-scope'
import { DbQueryable } from './db.queryable'
import { localToken } from './local-token'

export interface DbTransactionClient extends DbQueryable, Disposable {
  commit(): Promise<void>
  rollback(): Promise<void>
}

export const DbTransactionClient = localToken.opinionated<DbTransactionClient>('DbTransactionClient', {
  multi: false,
  restrictScope: DbTransactionScope,
})

import { CustomInjectionScope } from '@dandi/core'

const DB_TRANSACTION_SCOPE = '@dandi/data#DbTransaction'

export interface DbTransactionScope extends CustomInjectionScope {
  description: '@dandi/data#DbTransaction'
}

export interface DbTransactionScopeInstance extends DbTransactionScope {
  instanceId: any
}

export const DbTransactionScope: DbTransactionScope = {
  description: DB_TRANSACTION_SCOPE,
  type: Symbol.for(DB_TRANSACTION_SCOPE),
}

let instanceId = 0
export function createDbTransactionScope(): DbTransactionScopeInstance {
  return Object.assign({ instanceId: instanceId++ }, DbTransactionScope)
}

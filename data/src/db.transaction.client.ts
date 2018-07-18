import { Disposable } from '@dandi/core';
import { InjectionToken } from '@dandi/di-core';

import { DbQueryable }           from './db.queryable';
import { localOpinionatedToken } from './local.token';

export interface DbTransactionClient extends DbQueryable, Disposable {
    commit(): Promise<void>;
    rollback(): Promise<void>
}

export const DbTransactionClient: InjectionToken<DbTransactionClient> =
    localOpinionatedToken<DbTransactionClient>('DbTransactionClient', {
        singleton: false,
        multi: false,
    });

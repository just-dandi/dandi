import { AppError, Disposable } from '@dandi/common';
import { Inject, Injectable, Logger, Resolver } from '@dandi/core';
import { DataMapper, DbClient, DbTransactionClient, TransactionFn } from '@dandi/data';
import { ModelValidator } from '@dandi/model-validation';

import { PgDbPool } from './pg.db.pool';
import { PgDbQueryableBase } from './pg.db.queryable';

export class TransactionAlreadyInProgressError extends AppError {
  constructor() {
    super('A transaction is already in progress for this client instance');
  }
}

@Injectable(DbClient)
export class PgDbClient extends PgDbQueryableBase<PgDbPool> implements DbClient, Disposable {
  private activeTransactions: DbTransactionClient[] = [];

  constructor(
    @Inject(PgDbPool) pool: PgDbPool,
    @Inject(DataMapper) dataMapper: DataMapper,
    @Inject(ModelValidator) modelValidator: ModelValidator,
    @Inject(Resolver) private resolver: Resolver,
    @Inject(Logger) private logger: Logger,
  ) {
    super(pool, dataMapper, modelValidator);
  }

  public async transaction<T>(transactionFn: TransactionFn<T>): Promise<T> {
    const transaction = (await this.resolver.resolve(DbTransactionClient)).singleValue;
    try {
      this.activeTransactions.push(transaction);

      return await Disposable.useAsync(transaction, async (transaction) => {
        return await transactionFn(transaction);
      });
    } catch (err) {
      throw err;
    } finally {
      this.activeTransactions.splice(this.activeTransactions.indexOf(transaction), 1);
    }
  }

  public async dispose(reason: string): Promise<void> {
    await this.activeTransactions.map((transaction) =>
      transaction.dispose(`aborting due to pool disposing: ${reason}`),
    );
  }
}

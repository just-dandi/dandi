import { AppError, Disposable } from '@dandi/common'
import { Inject, Injectable, Logger, Optional, Resolver } from '@dandi/core'
import { DbClient, DbTransactionClient, TransactionFn } from '@dandi/data'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { PgDbPool } from './pg.db.pool'
import { PgDbQueryableBase } from './pg.db.queryable'
import { PgDbModelBuilderOptions } from './pg.db.model.builder.options'

export class TransactionAlreadyInProgressError extends AppError {
  constructor() {
    super('A transaction is already in progress for this client instance')
  }
}

@Injectable(DbClient)
export class PgDbClient extends PgDbQueryableBase<PgDbPool> implements DbClient, Disposable {
  private activeTransactions: DbTransactionClient[] = [];

  constructor(
    @Inject(PgDbPool) pool: PgDbPool,
    @Inject(ModelBuilder) modelValidator: ModelBuilder,
    @Inject(Resolver) private resolver: Resolver,
    @Inject(Logger) private logger: Logger,
    @Inject(PgDbModelBuilderOptions)
    @Optional()
    modelBuilderOptions?: ModelBuilderOptions,
  ) {
    super(pool, modelValidator, modelBuilderOptions)
  }

  public async transaction<T>(transactionFn: TransactionFn<T>): Promise<T> {
    const transaction = (await this.resolver.resolve(DbTransactionClient)).singleValue
    try {
      this.activeTransactions.push(transaction)

      return await Disposable.useAsync(transaction, async (transaction) => {
        return await transactionFn(transaction)
      })
    } catch (err) {
      throw err
    } finally {
      this.activeTransactions.splice(this.activeTransactions.indexOf(transaction), 1)
    }
  }

  public async dispose(reason: string): Promise<void> {
    await this.activeTransactions.map((transaction) =>
      transaction.dispose(`aborting due to pool disposing: ${reason}`),
    )
  }
}

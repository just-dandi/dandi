import { Constructor, Disposable } from '@dandi/common'
import { Inject, Injectable, Logger, Optional, Injector } from '@dandi/core'
import { DbClient, DbTransactionClient, TransactionFn } from '@dandi/data'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { PgDbPool } from './pg-db-pool'
import { PgDbQueryableBase } from './pg-db-queryable'
import { PgDbModelBuilderOptions } from './pg-db-model-builder-options'

@Injectable(DbClient)
export class PgDbClient extends PgDbQueryableBase<PgDbPool> implements DbClient, Disposable {
  private activeTransactions: DbTransactionClient[] = []

  constructor(
    @Inject(PgDbPool) private pool: PgDbPool,
    @Inject(ModelBuilder) modelValidator: ModelBuilder,
    @Inject(Injector) private injector: Injector,
    @Inject(Logger) private logger: Logger,
    @Inject(PgDbModelBuilderOptions)
    @Optional()
    modelBuilderOptions?: ModelBuilderOptions,
  ) {
    super(modelValidator, modelBuilderOptions)
  }

  public query(cmd: string, ...args: any[]): Promise<any[]> {
    return this.baseQuery(this.pool, cmd, args)
  }

  public queryModel<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T[]> {
    return this.baseQueryModel(this.pool, model, cmd, args)
  }

  public queryModelSingle<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T> {
    return this.baseQueryModelSingle(this.pool, model, cmd, args)
  }

  public async transaction<T>(transactionFn: TransactionFn<T>): Promise<T> {
    return Disposable.useAsync(this.injector.inject(DbTransactionClient), async transactionResult => {
      const transaction = transactionResult.singleValue
      this.activeTransactions.push(transaction)

      try {
        // IMPORTANT! must await the useAsync so that errors are caught and the active transaction is not removed
        // until the transaction is complete
        return await transactionFn(transaction)
      } catch (err) {
        throw err
      } finally {
        this.activeTransactions.splice(this.activeTransactions.indexOf(transaction), 1)
      }
    })
  }

  public async dispose(reason: string): Promise<void> {
    await this.activeTransactions.map((transaction) =>
      transaction.dispose(`aborting due to pool disposing: ${reason}`),
    )
  }
}

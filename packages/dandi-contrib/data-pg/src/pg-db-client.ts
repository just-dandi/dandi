import { Constructor, Disposable } from '@dandi/common'
import { Inject, Injectable, Logger, Optional, Injector } from '@dandi/core'
import { createDbTransactionScope, DbClient, DbTransactionClient, TransactionFn } from '@dandi/data'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { PgDbModelBuilderOptions } from './pg-db-model-builder-options'
import { PgDbPoolClient } from './pg-db-pool-client'
import { PgDbQueryableBase } from './pg-db-queryable'

@Injectable(DbClient)
export class PgDbClient extends PgDbQueryableBase<PgDbPoolClient> implements DbClient, Disposable {
  private activeTransactions: DbTransactionClient[] = []

  constructor(
    @Inject(PgDbPoolClient) private pool: PgDbPoolClient,
    @Inject(ModelBuilder) modelValidator: ModelBuilder,
    @Inject(Injector) private injector: Injector,
    @Inject(Logger) private logger: Logger,
    @Inject(PgDbModelBuilderOptions) @Optional() modelBuilderOptions?: ModelBuilderOptions,
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
    // TBD: is this better implemented using invoke?
    return await Disposable.useAsync(this.injector.createChild(createDbTransactionScope()), async (injector) => {
      return await Disposable.useAsync(
        (await injector.inject(DbTransactionClient)).singleValue,
        async (transaction) => {
          this.activeTransactions.push(transaction)

          try {
            // IMPORTANT! must await the useAsync so that errors are caught and the active transaction is not removed
            // until the transaction is complete
            return await transactionFn(transaction)
          } finally {
            this.activeTransactions.splice(this.activeTransactions.indexOf(transaction), 1)
          }
        },
      )
    })
  }

  public async dispose(reason: string): Promise<void> {
    await this.activeTransactions.map((transaction) => transaction.dispose(`aborting due to pool disposing: ${reason}`))
  }
}

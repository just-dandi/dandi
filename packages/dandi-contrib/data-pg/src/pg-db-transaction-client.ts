import { AppError, AsyncMutex, Constructor, Disposable, LockedObject } from '@dandi/common'
import { Inject, Injectable, Logger, Optional } from '@dandi/core'
import { DbQueryable, DbTransactionClient } from '@dandi/data'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { PgDbPoolClient } from './pg-db-pool-client'
import { PgDbTransactionQueryError } from './pg-db-query-error'
import { PgDbQueryableBase } from './pg-db-queryable'
import { PgDbModelBuilderOptions } from './pg-db-model-builder-options'
import { InvalidTransactionStateError } from './invalid-transaction-state-error'

export enum TransactionState {
  idle = 'IDLE',
  beginning = 'BEGINNING',
  ready = 'READY',
  committing = 'COMMITTING',
  committed = 'COMMITTED',
  rollingBack = 'ROLLING_BACK',
  rolledBack = 'ROLLED_BACK',
}

enum TransactionAction {
  begin = 'BEGIN',
  commit = 'COMMIT',
  reset = 'RESET',
  rollback = 'ROLLBACK',
}

type TransactionQueryFn = (client: PgDbPoolClient) => Promise<any>

const TRANSITIONS = {
  [TransactionAction.begin]: TransactionState.beginning,
  [TransactionAction.commit]: TransactionState.committing,
  [TransactionAction.reset]: TransactionState.idle,
  [TransactionAction.rollback]: TransactionState.rollingBack,
}

const COMPLETION_TRANSITIONS = {
  [TransactionAction.begin]: TransactionState.ready,
  [TransactionAction.commit]: TransactionState.committed,
  [TransactionAction.rollback]: TransactionState.rolledBack,
}

const ALLOWED_ACTIONS = {
  [TransactionState.idle]: [TransactionAction.begin],
  [TransactionState.ready]: [TransactionAction.commit, TransactionAction.rollback],
  [TransactionState.committing]: [TransactionAction.rollback],
  [TransactionState.committed]: [TransactionAction.reset],
  [TransactionState.rolledBack]: [TransactionAction.reset],
}

export class TransactionRollbackError extends AppError {
  constructor(rollbackError: Error, public readonly originalError?: Error) {
    super('Error rolling back transaction', rollbackError)
  }
}

@Injectable(DbTransactionClient)
export class PgDbTransactionClient extends PgDbQueryableBase<PgDbPoolClient> implements DbTransactionClient, DbQueryable {

  private state: TransactionState = TransactionState.idle
  private readonly mutex: AsyncMutex<PgDbPoolClient>

  constructor(
    @Inject(PgDbPoolClient) client: PgDbPoolClient,
    @Inject(ModelBuilder) modelValidator: ModelBuilder,
    @Inject(Logger) private logger: Logger,
    @Inject(PgDbModelBuilderOptions)
    @Optional()
    modelBuilderOptions?: ModelBuilderOptions,
  ) {
    super(modelValidator, modelBuilderOptions)

    this.mutex = AsyncMutex.for(client)
  }

  public query(cmd: string, ...args: any[]): Promise<any[]> {
    return this.transactionQuery(client => this.baseQuery(client, cmd, args))
  }

  public queryModel<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T[]> {
    return this.transactionQuery(client => this.baseQueryModel(client, model, cmd, args))
  }

  public async queryModelSingle<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T> {
    return this.transactionQuery(client => this.baseQueryModelSingle(client, model, cmd, args))
  }

  public async rollback(err?: Error): Promise<void> {
    await this.mutex.runLocked(async (lockedClient) => {
      this.validateTransactionAction(TransactionAction.rollback)
      try {
        await this.executeAction(lockedClient, TransactionAction.rollback)
        await this.validateAndExecuteAction(lockedClient, TransactionAction.reset)
      } catch (rollbackError) {
        this.logger.error('error rolling back transaction', rollbackError)
        throw new TransactionRollbackError(rollbackError, err)
      }
    })
    if (err) {
      throw err
    }
  }

  public async commit(): Promise<void> {
    return this.mutex.runLocked(async (lockedClient) => {
      this.validateTransactionAction(TransactionAction.commit)
      try {
        await this.executeAction(lockedClient, TransactionAction.commit)
        await this.validateAndExecuteAction(lockedClient, TransactionAction.reset)
      } catch (err) {
        this.logger.warn('error committing transaction', err)
        if (ALLOWED_ACTIONS[this.state].includes(TransactionAction.rollback)) {
          const rollback = this.rollback(err)
          lockedClient.dispose('query error')
          await rollback
        } else {
          throw err
        }
      }
    })
  }

  public async dispose(reason: string): Promise<void> {
    try {
      if (this.state === TransactionState.ready) {
        await this.commit()
      }
    } finally {
      await this.mutex.dispose(reason)
      Disposable.remapDisposed(this, reason)
    }
  }

  private async transactionQuery(queryFn: TransactionQueryFn): Promise<any> {
    return await this.mutex.runLocked(async (lockedClient) => {
      await this.safeBeginTransaction(lockedClient)
      try {
        return await queryFn.call(this, lockedClient)
      } catch (err) {
        const rollback = this.rollback()
        lockedClient.dispose('query error')
        await rollback
        throw new PgDbTransactionQueryError(err)
      }
    })
  }

  private validateTransactionAction(action: TransactionAction): void {
    if (!ALLOWED_ACTIONS[this.state].includes(action)) {
      throw new InvalidTransactionStateError(`Cannot perform action ${action} while in transaction state ${this.state}`)
    }
  }

  private async executeAction(lockedClient: LockedObject<PgDbPoolClient>, action: TransactionAction): Promise<void> {
    this.state = TRANSITIONS[action]
    if (action !== TransactionAction.reset) {
      await this.baseQuery(lockedClient, action)
    }
    if (COMPLETION_TRANSITIONS[action]) {
      this.state = COMPLETION_TRANSITIONS[action]
    }
  }

  private async validateAndExecuteAction(lockedClient: LockedObject<PgDbPoolClient>, action: TransactionAction): Promise<void> {
    this.validateTransactionAction(action)
    await this.executeAction(lockedClient, action)
  }

  private async safeBeginTransaction(lockedClient: LockedObject<PgDbPoolClient>): Promise<void> {
    if (this.state === TransactionState.idle) {
      await this.validateTransactionAction(TransactionAction.begin)
      await this.executeAction(lockedClient, TransactionAction.begin)
    }
    if (this.state !== TransactionState.ready && this.state !== TransactionState.beginning) {
      throw new InvalidTransactionStateError(`query cannot be called while the transaction is in the '${this.state}' state`)
    }
  }
}

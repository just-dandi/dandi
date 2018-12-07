import { AppError } from '@dandi/common'

export class PgDbQueryError extends AppError {
  constructor(innerError: Error) {
    super(`An error occurred executing a database query: ${innerError.message}`, innerError)
  }
}

export class PgDbTransactionQueryError extends AppError {
  constructor(innerError: Error) {
    super(`An error occurred executing a transactional database query: ${innerError.message}`, innerError)
  }
}

export class PgDbMultipleResultsError extends AppError {
  constructor(public readonly cmd: string) {
    super(`Received more than one result when expecting one`)
  }
}

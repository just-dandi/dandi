import { AppError } from '@dandi/common'

export class InvalidTransactionStateError extends AppError {
  constructor(message: string) {
    super(message)
  }
}

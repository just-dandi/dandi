import { AppError } from '@dandi/common'

export class InvalidConfigClientError extends AppError {
  constructor(message?: string) {
    super(message)
  }
}

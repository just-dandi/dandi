import { AppError } from '@dandi/common'

export class DandiApplicationError extends AppError {
  constructor(message: string, innerError?: Error) {
    super(message, innerError)
  }
}

export class MissingTokenError extends DandiApplicationError {
  constructor() {
    super('The `token` argument is required')
  }
}

export class InvalidTokenError extends DandiApplicationError {
  constructor(token: any) {
    super(`${token} is not a valid injection token`)
  }
}

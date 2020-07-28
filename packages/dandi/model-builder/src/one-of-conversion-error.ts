import { AppError, Constructor } from '@dandi/common'

export interface OneOfConversionAttempt {
  type: Constructor
  error: Error
}

export class OneOfConversionError extends AppError {
  constructor(public readonly attempts: OneOfConversionAttempt[]) {
    super(`Could not convert to any of the specified types`)
  }
}

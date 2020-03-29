import { AppError } from '@dandi/common'

export interface MemberErrorData {
  errorKey: string
  errorData?: any
  message?: string
}

export class ModelError extends AppError implements MemberErrorData {
  constructor(
    public readonly memberKey: string,
    public readonly errorKey: string,
    message?: string,
    innerError?: Error,
    public readonly errorData?: any,
  ) {
    super(message, innerError)
  }
}

import { ModelError } from './model-error'

export class ModelValidationError extends ModelError {
  constructor(
    memberKey: string,
    errorKey: string,
    public readonly metaValue?: any,
    message?: string,
  ) {
    super(memberKey, errorKey, message)
  }
}

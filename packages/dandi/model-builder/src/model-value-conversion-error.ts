import { ModelError } from './model-error'

export class ModelValueConversionError extends ModelError {
  constructor(
    memberKey: string,
    errorKey: string,
    innerError?: Error,
  ) {
    super(memberKey, errorKey, `Could not convert source value to ${errorKey}`, innerError)
  }
}

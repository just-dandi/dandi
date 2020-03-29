import { ModelErrorKey } from './model-error-key'
import { ModelValidationError } from './model-validation-error'

export class RequiredPropertyError extends ModelValidationError {
  constructor(memberKey: string) {
    super(memberKey, ModelErrorKey.required)
  }
}

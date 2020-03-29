import { AppError, Constructor } from '@dandi/common'

import { ModelError } from './model-error'
import { ModelErrors } from './model-errors'

export class ModelErrorsError extends AppError {
  constructor(public readonly modelErrors: ModelErrors) {
    super(modelErrors.toString())
  }
}

export class ModelBuilderError extends ModelErrorsError {

  constructor(
    public readonly type: Constructor,
    public readonly errors: ModelError[],
    modelErrors?: ModelErrors,
  ) {
    super(modelErrors || ModelErrors.create(type, errors))
  }
}

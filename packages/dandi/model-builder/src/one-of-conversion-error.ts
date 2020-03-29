import { Constructor } from '@dandi/common'

import { ModelError } from './model-error'

export interface OneOfConversionAttempt {
  type: Constructor
  errors: Error[]
}

export class OneOfConversionError extends ModelError {
  constructor(
    memberKey: string,
    errorKey: string,
    public readonly attempts: OneOfConversionAttempt[],
  ) {
    super(memberKey, errorKey, 'Could not convert to any of the specified types', undefined, attempts)
  }
}

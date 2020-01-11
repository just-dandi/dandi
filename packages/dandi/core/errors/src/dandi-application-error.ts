import { AppError } from '@dandi/common'
import { OpinionatedToken } from '@dandi/core/types'

import { getInjectionScopeName } from '../../internal/util/src/injection-scope-util'

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
  constructor(public readonly token: any) {
    super(`${token} is not a valid injection token`)
  }
}

export class InvalidTokenScopeError extends DandiApplicationError {
  constructor(public readonly token: OpinionatedToken<any>) {
    super(`Cannot inject ${token} outside of scope restriction - must be child of ${getInjectionScopeName(token.options.restrictScope)}`)
  }
}

import * as util from 'util'

import { AppError } from '@dandi/common'

import { InjectionToken, getTokenString } from './injection-token'
import { InjectorContext } from './injector-context'

export class MissingProviderError<T> extends AppError {
  constructor(public readonly token: InjectionToken<T>, private context: InjectorContext) {
    super(`No provider for ${getTokenString(token)} while resolving ${context[util.inspect.custom]()}`)
  }

  public [util.inspect.custom](): string {
    return this.context[util.inspect.custom]()
  }
}

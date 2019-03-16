import { AppError, CUSTOM_INSPECTOR } from '@dandi/common'

import { InjectionToken, getTokenString } from './injection-token'
import { InjectorContext } from './injector-context'

/**
 * Thrown when there is no configured [[Provider]] for an [[InjectionToken]] when attempting to resolve a required
 * dependency.
 */
export class MissingProviderError<T> extends AppError {
  constructor(public readonly token: InjectionToken<T>, private context: InjectorContext) {
    super(`No provider for ${getTokenString(token)} while resolving ${context[CUSTOM_INSPECTOR]()}`)
  }

  public [CUSTOM_INSPECTOR](): string {
    return this.context[CUSTOM_INSPECTOR]()
  }
}

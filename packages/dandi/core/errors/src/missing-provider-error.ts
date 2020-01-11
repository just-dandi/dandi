import { AppError, CUSTOM_INSPECTOR } from '@dandi/common'
import { InjectionToken, InjectorContext } from '@dandi/core/types'

import { getTokenString } from '../../internal/util/src/injection-token-util'

export class MissingProviderError<T> extends AppError {
  constructor(public readonly token: InjectionToken<T>, public readonly context: InjectorContext) {
    super(`No provider for ${getTokenString(token)} \n\tresolving ${context[CUSTOM_INSPECTOR]()}`)
  }

  public [CUSTOM_INSPECTOR](): string {
    return this.context[CUSTOM_INSPECTOR]()
  }
}

import { AppError, CUSTOM_INSPECTOR } from '@dandi/common'
import { InjectionToken, InjectorContext } from '@dandi/core/types'

import { getTokenString } from '../../internal/util/src/injection-token-util'

export class DandiInjectionError<T> extends AppError {
  /**
   * @internal
   */
  constructor(
    public readonly token: InjectionToken<T>,
    public readonly context: InjectorContext,
    messageStart: string,
    innerError?: Error,
  ) {
    super(`${messageStart} ${getTokenString(token)} \nfor ${context[CUSTOM_INSPECTOR]()}`, innerError)

    this.stack = this.getStack()
  }
}

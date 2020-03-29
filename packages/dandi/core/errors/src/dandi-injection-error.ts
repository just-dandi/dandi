import { AppError, Constructor, CUSTOM_INSPECTOR } from '@dandi/common'
import { InjectionToken, InjectorContext } from '@dandi/core/types'

import { getTokenString } from '../../internal/util/src/injection-token-util'
import { globalSymbol } from '../../src/global-symbol'

const WRAP_INJECTION_ERROR = globalSymbol('WRAP_INJECTION_ERROR')

export class DandiInjectionError<T> extends AppError {

  public static doNotWrap(errClass: Constructor<AppError>): void {
    Object.defineProperty(errClass.prototype, WRAP_INJECTION_ERROR, {
      value: false,
      configurable: false,
    })
  }

  public static shouldWrap(err: any): boolean {
    return !(err instanceof DandiInjectionError) && err[WRAP_INJECTION_ERROR] !== false
  }

  /**
   * @internal
   */
  constructor(public readonly token: InjectionToken<T>, public readonly context: InjectorContext, messageStart: string, innerError?: Error) {
    super(`${messageStart} ${getTokenString(token)} \nfor ${context[CUSTOM_INSPECTOR]()}`, innerError)
  }
}
DandiInjectionError.doNotWrap(DandiInjectionError)

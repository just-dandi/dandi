import { AppError } from './app-error'

/**
 * A utility class for working with `Error` instances
 */
export class ErrorUtil {

  /**
   * Returns an object consisting only of any custom properties specified by the error type.
   * @param error An *Error* instance
   */
  public static getCustomProperties(error: Error): any {
    return Object.keys(error)
      .filter((key) => !Error.prototype.hasOwnProperty(key))
      .reduce((result, key) => {
        result[key] = error[key]
        return result
      }, {})
  }

  /**
   * Returns an object with the `message` and `stack` properties populated from the specified `error`, including
   * any custom properties defined on the `error` (as determined by [[ErrorUtil.getCustomProperties]]). Uses
   * [[AppError.stack]] to construct the `stack` property.
   * @param error
   */
  public static getLoggableError(error: Error): any {
    return Object.assign(ErrorUtil.getCustomProperties(error), {
      message: error.message,
      stack: AppError.stack(error),
    })
  }

  /**
   * @ignore
   * @param source
   * @param message
   * @param event
   * @param error
   */
  public static logEventError(source: string, message: string, event: any, error: Error): void {
    console.error(`[${source}] ${message}`, {
      event,
      error: ErrorUtil.getLoggableError(error),
    })
  }
}

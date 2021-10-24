import { AppError } from './app-error'

export class ErrorUtil {
  public static getCustomProperties(error: Error): any {
    return Object.keys(error)
      .filter((key) => !Object.prototype.hasOwnProperty.call(Error, key))
      .reduce((result, key) => {
        result[key] = error[key]
        return result
      }, {})
  }

  public static getLoggableError(error: Error): any {
    return Object.assign(ErrorUtil.getCustomProperties(error), {
      message: error.message,
      stack: AppError.stack(error),
    })
  }

  public static logEventError(source: string, message: string, event: any, error: Error): void {
    console.error(`[${source}] ${message}`, {
      event,
      error: ErrorUtil.getLoggableError(error),
    })
  }
}

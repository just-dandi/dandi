import { LoggerMethod } from './logger-method'
import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

/**
 * A service used to generate {@see LogEntry} objects and publish them to the {@see LogStream}.
 */
export interface Logger {

  /**
   * Publishes a [[LogLevel.debug]] severity entry
   */
  debug: LoggerMethod

  /**
   * Publishes a [[LogLevel.info]] severity entry
   */
  info: LoggerMethod

  /**
   * Publishes a [[LogLevel.warn]] severity entry
   */
  warn: LoggerMethod

  /**
   * Publishes a [[LogLevel.error]] severity entry
   */
  error: LoggerMethod
}

export const Logger: InjectionToken<Logger> = localOpinionatedToken<Logger>('Logger', {
  multi: false,
  singleton: false,
})

import { localToken } from'../../src/local-token'

import { LoggerMethod } from './logger-method'
import { InjectionToken } from './injection-token'

export interface Logger {
  debug: LoggerMethod
  info: LoggerMethod
  warn: LoggerMethod
  error: LoggerMethod
}

export const Logger: InjectionToken<Logger> = localToken.opinionated<Logger>('Logger', {
  multi: false,
  singleton: false,
})

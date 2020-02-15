import { localToken } from'../../src/local-token'

import { InjectionToken } from './injection-token'
import { LoggerMethod } from './logger-method'

export interface Logger {
  debug: LoggerMethod
  info: LoggerMethod
  warn: LoggerMethod
  error: LoggerMethod
  trace: LoggerMethod
}

export const Logger: InjectionToken<Logger> = localToken.opinionated<Logger>('Logger', {
  multi: false,
})

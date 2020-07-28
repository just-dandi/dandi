import { localToken } from '../../src/local-token'

import { LoggerMethod } from './logger-method'

export interface Logger {
  debug: LoggerMethod
  info: LoggerMethod
  warn: LoggerMethod
  error: LoggerMethod
  trace: LoggerMethod
}

export const Logger = localToken.opinionated<Logger>('Logger', {
  multi: false,
})

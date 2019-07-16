import { LoggerMethod } from './logger-method'
import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'

export interface Logger {
  debug: LoggerMethod
  info: LoggerMethod
  warn: LoggerMethod
  error: LoggerMethod
}

export const Logger: InjectionToken<Logger> = localOpinionatedToken<Logger>('Logger', {
  multi: false,
  singleton: false,
})

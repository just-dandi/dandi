import { InjectionToken } from './injection.token'
import { localOpinionatedToken } from './local.token'
import { LogLevel } from './log.level'

export type LoggerMethod = (...args: any[]) => void

export interface Logger {
  log(level: LogLevel, ...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export const Logger: InjectionToken<Logger> = localOpinionatedToken<Logger>('Logger', { multi: false })

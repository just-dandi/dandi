import { InjectionContext } from './injection-context'
import { LogLevel } from './log-level'
import { LogCallOptions } from './logger-method'

export interface LogEntry {
  level: LogLevel
  context: InjectionContext
  ts: number
  args: any[]
  options?: LogCallOptions
}

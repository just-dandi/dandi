import { InjectionScope } from './injection-scope'
import { LogLevel } from './log-level'
import { LogCallOptions } from './logger-method'

export interface LogEntry {
  level: LogLevel
  context: InjectionScope
  ts: number
  args: any[]
  options?: LogCallOptions
}

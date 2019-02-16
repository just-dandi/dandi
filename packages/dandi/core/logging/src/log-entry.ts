import { InjectionContext, LogCallOptions, LogLevel } from '@dandi/core'

export interface LogEntry {
  level: LogLevel
  context: InjectionContext
  ts: number
  args: any[]
  options?: LogCallOptions
}

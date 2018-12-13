import { InjectionContext, LogLevel } from '@dandi/core'

export interface LogEntry {
  level: LogLevel
  context: InjectionContext
  ts: number
  args: any[]
}

import { InjectionToken } from '@dandi/core'

import { LogEntry } from './log-entry'
import { localOpinionatedToken } from './local.token'

export interface LogListener {
  log(entry: LogEntry): void
}

export const LogListener: InjectionToken<LogListener> = localOpinionatedToken('LogListener', {
  multi: true,
})

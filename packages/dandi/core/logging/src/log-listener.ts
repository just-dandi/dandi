import { LogEntry } from '@dandi/core'

import { localToken } from './local-token'

export interface LogListener {
  log(entry: LogEntry): void
}

export const LogListener = localToken.opinionated<LogListener>('LogListener', {
  multi: true,
})

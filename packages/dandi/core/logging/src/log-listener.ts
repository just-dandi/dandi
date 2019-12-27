import { InjectionToken, LogEntry } from '@dandi/core'

import { localToken } from './local-token'

export interface LogListener {
  log(entry: LogEntry): void
}

export const LogListener: InjectionToken<LogListener> = localToken.opinionated<LogListener>('LogListener', {
  multi: true,
})

import { PartialObserver, Subscription } from 'rxjs'

import { localToken } from '../../src/local-token'

import { LogEntry } from './log-entry'
import { ScopeRestriction } from './scope-restriction'

export interface LogStream {
  next(value: LogEntry): void
  subscribe(observer?: PartialObserver<LogEntry>): Subscription
  subscribe(next?: (value: LogEntry) => void, error?: (error: any) => void, complete?: () => void): Subscription
}

export const LogStream = localToken.opinionated<LogStream>('LogStream', {
  multi: false,
  restrictScope: ScopeRestriction.root,
})

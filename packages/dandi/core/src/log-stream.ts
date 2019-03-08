import { PartialObserver, Subscription } from 'rxjs'

import { InjectionToken } from './injection-token'
import { localOpinionatedToken } from './local-token'
import { LogEntry } from './log-entry'

export interface LogStream {
  next(value: LogEntry): void
  subscribe(observer?: PartialObserver<LogEntry>): Subscription
  subscribe(next?: (value: LogEntry) => void, error?: (error: any) => void, complete?: () => void): Subscription
}

export const LogStream: InjectionToken<LogStream> = localOpinionatedToken('LogStream', {
  singleton: true,
  multi: false,
})

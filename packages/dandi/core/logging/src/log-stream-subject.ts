import { Injectable, LogEntry, LogStream } from '@dandi/core'
import { Subject } from 'rxjs'

/**
 * An implementation of [[LogStream]] based on a `Subject` from `rxjs`
 */
@Injectable(LogStream)
export class LogStreamSubject extends Subject<LogEntry> implements LogStream {

  constructor() {
    super()
  }

}

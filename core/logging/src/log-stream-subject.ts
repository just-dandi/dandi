import { Injectable } from '@dandi/core'
import { Subject } from 'rxjs'

import { LogEntry } from './log-entry'
import { LogStream } from './log-stream'

@Injectable(LogStream)
export class LogStreamSubject extends Subject<LogEntry> implements LogStream {

  constructor() {
    super()
  }

}

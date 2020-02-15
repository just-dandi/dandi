import {
  InjectionScope,
  LogEntry,
  LogLevel,
  LogCallOptions,
  LogStream,
  NowFn,
} from '@dandi/core/types'

import { LoggerBase } from './logger-base'

export class QueueingLogger extends LoggerBase {

  private readonly entries: LogEntry[] = []

  constructor(private context: InjectionScope, private now: NowFn) {
    super()
  }

  public flush(stream: LogStream): void {
    while(this.entries.length) {
      stream.next(this.entries.shift())
    }
  }

  protected log(level: LogLevel, options: LogCallOptions, ...args: any[]): void {
    this.entries.push({
      level,
      args,
      ts: this.now(),
      context: this.context,
      options,
    })
  }

}

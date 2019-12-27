import { createLoggerMethodChain } from '@dandi/core/internal/util'
import {
  Logger,
  LoggerMethod,
  LogLevel,
  LogEntry,
  InjectionScope,
  NowFn,
  LogStream,
  LogCallOptions,
} from '@dandi/core/types'


export class QueueingLogger implements Logger {

  public get debug(): LoggerMethod {
    return createLoggerMethodChain(this.log.bind(this, LogLevel.debug))
  }

  public get info(): LoggerMethod {
    return createLoggerMethodChain(this.log.bind(this, LogLevel.info))
  }

  public get warn(): LoggerMethod {
    return createLoggerMethodChain(this.log.bind(this, LogLevel.warn))
  }

  public get error(): LoggerMethod {
    return createLoggerMethodChain(this.log.bind(this, LogLevel.error))
  }

  private readonly entries: LogEntry[] = []

  constructor(private context: InjectionScope, private now: NowFn) {}

  public flush(stream: LogStream): void {
    while(this.entries.length) {
      stream.next(this.entries.shift())
    }
  }

  private log(level: LogLevel, options: LogCallOptions, ...args: any[]): void {
    this.entries.push({
      level,
      args,
      ts: this.now(),
      context: this.context,
      options,
    })
  }

}

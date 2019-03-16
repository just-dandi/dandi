import { Logger } from './logger'
import { LoggerMethod, createLoggerMethodChain, LogCallOptions } from './logger-method'
import { LogLevel } from './log-level'
import { InjectionContext } from './injection-context'
import { NowFn } from './now-fn'
import { LogEntry } from './log-entry'
import { LogStream } from './log-stream'

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

  constructor(private context: InjectionContext, private now: NowFn) {}

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

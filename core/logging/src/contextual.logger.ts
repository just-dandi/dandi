import { Inject, Injectable, InjectionContext, Logger, LoggerMethod, LogLevel, Now, NowFn } from '@dandi/core'

import { LogStream } from './log-stream'

@Injectable(Logger)
export class ContextualLogger implements Logger {

  public readonly debug: LoggerMethod;
  public readonly info: LoggerMethod;
  public readonly warn: LoggerMethod;
  public readonly error: LoggerMethod;

  constructor(
    @Inject(LogStream) private stream: LogStream,
    @Inject(InjectionContext) private context: InjectionContext,
    @Inject(Now) private now: NowFn,
  ) {
    this.debug = this.log.bind(this, LogLevel.debug)
    this.info = this.log.bind(this, LogLevel.info)
    this.warn = this.log.bind(this, LogLevel.warn)
    this.error = this.log.bind(this, LogLevel.error)
  }

  public log(level: LogLevel, ...args: any[]): void {
    this.stream.next({
      level,
      args,
      ts: this.now(),
      context: this.context,
    })
  }

}

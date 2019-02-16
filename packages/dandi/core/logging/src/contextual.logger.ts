import {
  createLoggerMethodChain,
  Inject,
  Injectable,
  InjectionContext, LogCallOptions,
  Logger,
  LoggerMethod,
  LogLevel,
  Now,
  NowFn,
} from '@dandi/core'

import { LogStream } from './log-stream'

@Injectable(Logger)
export class ContextualLogger implements Logger {

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

  constructor(
    @Inject(LogStream) private stream: LogStream,
    @Inject(InjectionContext) private context: InjectionContext,
    @Inject(Now) private now: NowFn,
  ) {}

  private log(level: LogLevel, options: LogCallOptions, ...args: any[]): void {
    this.stream.next({
      level,
      args,
      ts: this.now(),
      context: this.context,
      options,
    })
  }

}

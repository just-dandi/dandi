import {
  Inject,
  Injectable,
  InjectionScope,
  LogCallOptions,
  Logger,
  LoggerMethod,
  LogLevel,
  LogStream,
  Now,
  NowFn,
  RestrictScope,
  ScopeBehavior,
} from '@dandi/core'
import { createLoggerMethodChain } from '@dandi/core/internal/util'

@Injectable(Logger, RestrictScope(ScopeBehavior.perInjector))
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
    @Inject(InjectionScope) private context: InjectionScope,
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

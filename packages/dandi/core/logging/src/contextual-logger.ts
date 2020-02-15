import {
  Inject,
  Injectable,
  InjectionScope,
  LogCallOptions,
  Logger,
  LogLevel,
  LogStream,
  Now,
  NowFn,
  RestrictScope,
  ScopeBehavior,
} from '@dandi/core'
import { LoggerBase } from '@dandi/core/internal'

@Injectable(Logger, RestrictScope(ScopeBehavior.perInjector))
export class ContextualLogger extends LoggerBase {

  constructor(
    @Inject(LogStream) private stream: LogStream,
    @Inject(InjectionScope) private context: InjectionScope,
    @Inject(Now) private now: NowFn,
  ) {
    super()
  }

  protected log(level: LogLevel, options: LogCallOptions, ...args: any[]): void {
    this.stream.next({
      level,
      args,
      ts: this.now(),
      context: this.context,
      options,
    })
  }

}

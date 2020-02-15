import { createLoggerMethodChain } from '@dandi/core/internal/util'
import {
  LogCallOptions,
  Logger,
  LoggerMethod,
  LogLevel,
} from '@dandi/core/types'

/**
 * @internal
 */
export abstract class LoggerBase implements Logger {

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

  public get trace(): LoggerMethod {
    return createLoggerMethodChain(this.log.bind(this, LogLevel.trace))
  }

  protected abstract log(level: LogLevel, options: LogCallOptions, ...args: any[]): void

}

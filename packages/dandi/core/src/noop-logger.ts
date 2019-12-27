import { Injectable } from '@dandi/core/decorators'
import { createLoggerMethodChain } from '@dandi/core/internal/util'
import { Logger, LoggerMethod } from '@dandi/core/types'

function nooper(): () => void {
  return function noop() {}
}

@Injectable(Logger)
export class NoopLogger implements Logger {

  public get debug(): LoggerMethod {
    return createLoggerMethodChain(nooper())
  }

  public get info(): LoggerMethod {
    return createLoggerMethodChain(nooper())
  }

  public get warn(): LoggerMethod {
    return createLoggerMethodChain(nooper())
  }

  public get error(): LoggerMethod {
    return createLoggerMethodChain(nooper())
  }

}

import { Injectable } from './injectable-decorator'
import { Logger } from './logger'
import { createLoggerMethodChain, LoggerMethod } from './logger-method'

function nooper(): () => void {
  return function noop() {}
}

/**
 * An implementation of [[Logger]] that doesn't do anything with your silly log data.
 */
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

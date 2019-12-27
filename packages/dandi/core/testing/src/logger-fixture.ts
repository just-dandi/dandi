import { Injectable, LogCallOptions, Logger, LoggerMethod } from '@dandi/core'
import { MODIFIER_KEYS } from '@dandi/core/internal/util'

import { stub } from 'sinon'

export function createLoggerMethodChain(logAction: (options: LogCallOptions, ...args: any[]) => void): LoggerMethod {
  MODIFIER_KEYS.forEach(key => {
    const chains = {}
    Object.defineProperty(logAction, key, {
      get: () => {
        if (!chains[key]) {
          chains[key] = createLoggerMethodChain(stub())
        }
        return chains[key]
      },
    })
  })
  return logAction as LoggerMethod
}
@Injectable(Logger)
export class LoggerFixture implements Logger {

  private readonly debugStub: LoggerMethod = createLoggerMethodChain(stub())
  public get debug(): LoggerMethod {
    return this.debugStub
  }

  private readonly infoStub: LoggerMethod = createLoggerMethodChain(stub())
  public get info(): LoggerMethod {
    return this.infoStub
  }

  private readonly warnStub: LoggerMethod = createLoggerMethodChain(stub())
  public get warn(): LoggerMethod {
    return this.warnStub
  }

  private readonly errorStub: LoggerMethod = createLoggerMethodChain(stub())
  public get error(): LoggerMethod {
    return this.errorStub
  }

}

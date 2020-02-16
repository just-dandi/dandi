import { ModuleBuilder, Registerable } from '@dandi/core'

import { ContextualLogger } from './contextual-logger'
import { localToken } from './local-token'
import { LogStreamSubject } from './log-stream-subject'
import { LoggerConfig } from './logger-config'

export class LoggingModuleBuilder extends ModuleBuilder<LoggingModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(LoggingModuleBuilder, localToken.PKG, ...entries)
  }

  public use(...entries: Registerable[]): this {
    return this.add(...entries)
  }
}

export const LoggingModule = new LoggingModuleBuilder(ContextualLogger, LoggerConfig, LogStreamSubject)

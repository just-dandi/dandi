import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { LoggerConfig } from './logger-config'
import { LogStreamSubject } from './log-stream-subject'
import { ContextualLogger } from './contextual-logger'

export class LoggingModuleBuilder extends ModuleBuilder<LoggingModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(LoggingModuleBuilder, localToken.PKG, ...entries)
  }

  public use(...entries: Registerable[]): this {
    return this.add(...entries)
  }
}

export const LoggingModule = new LoggingModuleBuilder(ContextualLogger, LoggerConfig, LogStreamSubject)

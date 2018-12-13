import { ModuleBuilder, Registerable } from '@dandi/core'

import { PKG } from './local.token'
import { LoggerConfig } from './logger-config'
import { LogStreamSubject } from './log-stream-subject'
import { ContextualLogger } from './contextual.logger'

export class LoggingModuleBuilder extends ModuleBuilder<LoggingModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(LoggingModuleBuilder, PKG, ...entries)
  }

  public use(...entries: Registerable[]): this {
    return this.add(...entries)
  }
}

export const LoggingModule = new LoggingModuleBuilder(ContextualLogger, LoggerConfig, LogStreamSubject)

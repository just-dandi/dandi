import { ModuleBuilder, Registerable } from '@dandi/core'

import { PKG } from './local-token'
import { LoggerConfig } from './logger-config'
import { LogStreamSubject } from './log-stream-subject'
import { ContextualLogger } from './contextual.logger'

/**
 * @internal
 * @ignore
 */
export class LoggingModuleBuilder extends ModuleBuilder<LoggingModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(LoggingModuleBuilder, PKG, ...entries)
  }

  public use(...entries: Registerable[]): this {
    return this.add(...entries)
  }
}

/**
 * A [[Module]] containing [[ContextualLogger]], [[LogStreamSubject]], and a [[Provider]] that automatically
 * subscribes any registered [[LogListener]] implementations to the [[LogStream]].
 */
export const LoggingModule = new LoggingModuleBuilder(ContextualLogger, LoggerConfig, LogStreamSubject)

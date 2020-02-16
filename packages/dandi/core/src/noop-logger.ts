import { Injectable } from '@dandi/core/decorators'
import { Logger } from '@dandi/core/types'

import { LoggerBase } from '../internal/src/logger-base'

@Injectable(Logger)
export class NoopLogger extends LoggerBase {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected log(): void {}
}

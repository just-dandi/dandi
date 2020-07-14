import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { SentryErrorHandler } from './sentry-error-handler'

export class SentryHttpPipelineModuleBuilder extends ModuleBuilder<SentryHttpPipelineModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SentryHttpPipelineModuleBuilder, localToken.PKG, entries)
  }
}

export const SentryHttpPipelineModule = new SentryHttpPipelineModuleBuilder(SentryErrorHandler)

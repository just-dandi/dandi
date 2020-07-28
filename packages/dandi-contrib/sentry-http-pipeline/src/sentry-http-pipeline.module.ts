import { ModuleBuilder, Registerable } from '@dandi/core'
import { HttpPipelineConfig } from '@dandi/http-pipeline'

import { localToken } from './local-token'
import { SentryErrorHandler } from './sentry-error-handler'
import { SentryHttpPipelineScopePreparer } from './sentry-http-pipeline-scope-preparer'
import { SentryOnBeforeInvokeHandler } from './sentry-on-before-invoke-handler'

export class SentryHttpPipelineModuleBuilder extends ModuleBuilder<SentryHttpPipelineModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SentryHttpPipelineModuleBuilder, localToken.PKG, entries)
    this.onConfig([HttpPipelineConfig], (config) => config.before.push(SentryHttpPipelineScopePreparer))
  }
}

export const SentryHttpPipelineModule = new SentryHttpPipelineModuleBuilder(
  SentryErrorHandler,
  SentryHttpPipelineScopePreparer,
  SentryOnBeforeInvokeHandler,
)

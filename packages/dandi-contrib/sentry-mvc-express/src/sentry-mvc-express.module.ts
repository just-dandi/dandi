import { ExpressInstance } from '@dandi-contrib/mvc-express'
import { SentryStatic } from '@dandi-contrib/sentry'
import { ModuleBuilder, Registerable } from '@dandi/core'
import { HttpPipelineConfig } from '@dandi/http-pipeline'

import { localToken } from './local-token'
import { SentryMvcScopePreparer } from './sentry-mvc-scope-preparer'

export class SentryMvcExpressModuleBuilder extends ModuleBuilder<SentryMvcExpressModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SentryMvcExpressModuleBuilder, localToken.PKG, entries)
    this.onConfig([ExpressInstance, SentryStatic], (app, sentry) => app.use(sentry.Handlers.requestHandler()))
    this.onConfig([HttpPipelineConfig], (config) => config.before.push(SentryMvcScopePreparer))
  }
}

export const SentryMvcExpressModule = new SentryMvcExpressModuleBuilder(SentryMvcScopePreparer)

import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { SentryMvcScopePreparer } from './sentry-mvc-scope-preparer'

export class SentryMvcModuleBuilder extends ModuleBuilder<SentryMvcModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(SentryMvcModuleBuilder, localToken.PKG, entries)
  }
}

export const SentryMvcModule = new SentryMvcModuleBuilder(SentryMvcScopePreparer)

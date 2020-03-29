import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { RequestModelErrorsCollector } from './request-model-errors-collector'
import { RequestParamModelBuilderOptionsProvider } from './request-param-decorator'

export class HttpModelModuleBuilder extends ModuleBuilder<HttpModelModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(HttpModelModuleBuilder, localToken.PKG, ...entries)
  }
}

export const HttpModelModule = new HttpModelModuleBuilder(
  RequestModelErrorsCollector,
  RequestParamModelBuilderOptionsProvider,
)

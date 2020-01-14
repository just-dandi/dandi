import { ModuleBuilder, Registerable } from '@dandi/core'

import { HttpRequestHeadersAccessor } from './http-request-headers'
import { HttpRequestRawBodyProvider } from './http-request-raw-body'
import { HttpRequestAcceptTypesProvider } from './http-request-accept-types'
import { PKG } from './local-token'

export class HttpModuleBuilder extends ModuleBuilder<HttpModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(HttpModuleBuilder, PKG, ...entries)
  }
}

export const HttpModule = new HttpModuleBuilder(
  HttpRequestHeadersAccessor,
  HttpRequestRawBodyProvider,
  HttpRequestAcceptTypesProvider,
)

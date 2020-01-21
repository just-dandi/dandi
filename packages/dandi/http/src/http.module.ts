import { ModuleBuilder, Registerable } from '@dandi/core'

import { HttpRequestAcceptTypesProvider } from './http-request-accept-types'
import { DandiHttpRequestHeadersAccessor } from './http-request-headers-accessor'
import { HttpRequestHeadersCache } from './http-request-headers-cache'
import { HttpRequestRawBodyProvider } from './http-request-raw-body'
import { PKG } from './local-token'

export class HttpModuleBuilder extends ModuleBuilder<HttpModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(HttpModuleBuilder, PKG, ...entries)
  }
}

export const HttpModule = new HttpModuleBuilder(
  DandiHttpRequestHeadersAccessor,
  HttpRequestAcceptTypesProvider,
  HttpRequestHeadersCache,
  HttpRequestRawBodyProvider,
)

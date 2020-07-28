import { Provider, ScopeBehavior } from '@dandi/core'

import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'
import { localToken } from './local-token'
import { MimeTypeInfo } from './mime-type-info'
import { parseMimeTypes } from './mime-type-util'

export type HttpRequestAcceptTypes = MimeTypeInfo[]
export const HttpRequestAcceptTypes = localToken.opinionated<MimeTypeInfo[]>('HttpRequestAcceptTypes', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

export const HttpRequestAcceptTypesProvider: Provider<HttpRequestAcceptTypes> = {
  provide: HttpRequestAcceptTypes,
  useFactory(req: HttpRequest) {
    return parseMimeTypes(req.get('Accept'))
  },
  deps: [HttpRequest],
}

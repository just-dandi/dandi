import { InjectionToken, Provider, ScopeBehavior } from '@dandi/core'

import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'
import { MimeTypeInfo } from './mime-type-info'
import { parseMimeTypes } from './mime-type-util'

export type HttpRequestAcceptTypes = MimeTypeInfo[]
export const HttpRequestAcceptTypes: InjectionToken<MimeTypeInfo[]> = localOpinionatedToken('HttpRequestAcceptTypes', {
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

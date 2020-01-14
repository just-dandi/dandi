import { InjectionToken, Provider, ScopeBehavior } from '@dandi/core'

import { localOpinionatedToken } from './local-token'
import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'
import { parseMimeTypes } from './mime-type'
import { MimeTypeInfo } from './mime-type-info'

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

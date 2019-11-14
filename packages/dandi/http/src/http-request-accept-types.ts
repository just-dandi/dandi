import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local-token'
import { parseMimeTypes } from './mime-type'
import { MimeTypeInfo } from './mime-type-info'
import { HttpRequest } from './http-request'

export type HttpRequestAcceptTypes = MimeTypeInfo[]
export const HttpRequestAcceptTypes: InjectionToken<MimeTypeInfo[]> = localOpinionatedToken('HttpRequestAcceptTypes', {
  multi: false,
  singleton: false,
})

export const HttpRequestAcceptTypesProvider: Provider<HttpRequestAcceptTypes> = {
  provide: HttpRequestAcceptTypes,
  useFactory(req: HttpRequest) {
    return parseMimeTypes(req.get('Accept'))
  },
  deps: [HttpRequest],
}

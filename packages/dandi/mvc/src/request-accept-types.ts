import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { parseMimeTypes } from './mime-type'
import { MimeTypeInfo } from './mime-type-info'
import { MvcRequest } from './mvc.request'

export type RequestAcceptTypes = MimeTypeInfo[]
export const RequestAcceptTypes: InjectionToken<MimeTypeInfo[]> = localOpinionatedToken('RequestAcceptTypes', {
  multi: false,
  singleton: false,
})

export const RequestAcceptTypesProvider: Provider<RequestAcceptTypes> = {
  provide: RequestAcceptTypes,
  useFactory(req: MvcRequest) {
    return parseMimeTypes(req.get('Accept'))
  },
  deps: [MvcRequest],
}

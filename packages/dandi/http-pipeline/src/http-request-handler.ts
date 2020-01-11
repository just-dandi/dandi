import { HttpRequestScope } from '@dandi/http'

import { localOpinionatedToken } from './local-token'

export const HttpRequestHandler = localOpinionatedToken<any>('HttpRequestHandler', {
  multi: false,
  restrictScope: HttpRequestScope,
})
export const HttpRequestHandlerMethod = localOpinionatedToken<string>('HttpRequestHandlerMethod', {
  multi: false,
  restrictScope: HttpRequestScope,
})

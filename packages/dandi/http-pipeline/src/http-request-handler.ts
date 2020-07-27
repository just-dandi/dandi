import { HttpRequestScope } from '@dandi/http'

import { localToken } from './local-token'

export const HttpRequestHandler = localToken.opinionated<any>('HttpRequestHandler', {
  multi: false,
  restrictScope: HttpRequestScope,
})
export const HttpRequestHandlerMethod = localToken.opinionated<string>('HttpRequestHandlerMethod', {
  multi: false,
  restrictScope: HttpRequestScope,
})

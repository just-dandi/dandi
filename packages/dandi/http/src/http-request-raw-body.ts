import { ScopeBehavior } from '@dandi/core'

import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'
import { localToken } from './local-token'

export const HttpRequestRawBody = localToken.opinionated<string | Buffer>('HttpRequestRawBody', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

// TODO: add functionality to allow feeding a data stream to the body body-parsing
export const HttpRequestRawBodyProvider = {
  provide: HttpRequestRawBody,
  useFactory(req: HttpRequest) {
    return req.body
  },
  deps: [HttpRequest],
}

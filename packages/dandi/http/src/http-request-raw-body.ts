import { localOpinionatedToken } from './local-token'
import { HttpRequest } from './http-request'

export const HttpRequestRawBody = localOpinionatedToken<string | Buffer>('HttpRequestRawBody', {
  multi: false,
  singleton: false,
})

// TODO: add functionality to allow feeding a data stream to the body body-parsing
export const HttpRequestRawBodyProvider = {
  provide: HttpRequestRawBody,
  useFactory(req: HttpRequest) {
    return req.body
  },
  deps: [
    HttpRequest,
  ],
}

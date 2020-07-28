import { HttpMethod } from './http-method'
import { HttpRequestScope } from './http-request-scope'
import { localToken } from './local-token'

export interface HttpRequest {
  body: any
  params: any
  path: string
  query: any
  method: HttpMethod
  get(key: string): any
}

export const HttpRequest = localToken.opinionated<HttpRequest>('HttpRequest', {
  multi: false,
  restrictScope: HttpRequestScope,
})

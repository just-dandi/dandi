import { InjectionToken } from '@dandi/core'

import { HttpMethod } from './http-method'
import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'

export interface HttpRequest {
  body: any
  params: any
  path: string
  query: any
  method: HttpMethod
  get(key: string): string
}

export const HttpRequest: InjectionToken<HttpRequest> = localOpinionatedToken<HttpRequest>('HttpRequest', {
  multi: false,
  restrictScope: HttpRequestScope,
})

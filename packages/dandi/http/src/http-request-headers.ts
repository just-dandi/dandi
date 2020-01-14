import { Injectable, Inject, ScopeBehavior } from '@dandi/core'

import { HttpHeader } from './http-header'
import { HttpHeadersStrict, HttpHeaders } from './http-headers'
import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'

export interface HttpRequestHeaders {
  get<THeaderName extends HttpHeader>(headerName: THeaderName): HttpHeadersStrict[THeaderName]
}

export const HttpRequestHeaders = localOpinionatedToken('HttpRequestHeaders', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

@Injectable(HttpRequestHeaders)
export class HttpRequestHeadersAccessor implements HttpRequestHeaders {

  constructor(@Inject(HttpRequest) private readonly request: HttpRequest) {}

  public get(headerName: string): any {
    return this.request.get(headerName.toLocaleLowerCase())
  }
}

export class HttpRequestHeadersHashAccessor implements HttpRequestHeaders {

  private readonly headers: HttpHeaders

  constructor(headers: HttpHeaders) {
    this.headers = Object.keys(headers).reduce((result, name) => {
      result[name.toLocaleLowerCase()] = headers[name]
      return result
    }, {})
  }

  public get(headerName: string): any {
    return this.headers[headerName.toLocaleLowerCase()]
  }


}

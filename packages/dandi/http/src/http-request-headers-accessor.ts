import { Injectable, Inject, ScopeBehavior } from '@dandi/core'

import { HttpHeader } from './http-header'
import { HttpHeadersRaw, HttpRequestHeader, HttpRequestHeaders } from './http-headers'
import { HttpRequest } from './http-request'
import { parseHeader } from './http-request-header-util'
import { HttpRequestHeadersCache } from './http-request-headers-cache'
import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'

export interface HttpRequestHeadersAccessor {
  get<THeaderName extends HttpRequestHeader>(headerName: THeaderName): HttpRequestHeaders[THeaderName]
}

export const HttpRequestHeadersAccessor = localOpinionatedToken('HttpRequestHeadersAccessor', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

export abstract class HttpRequestHeadersAccessorBase implements HttpRequestHeadersAccessor {

  protected constructor(protected readonly headers: Map<HttpRequestHeader, any>) {}

  public get<THeaderName extends HttpRequestHeader>(headerName: THeaderName): HttpRequestHeaders[THeaderName] {
    if (!this.headers.has(headerName)) {
      const rawHeaderValue = this.getRawHeaderValue(headerName)
      if (!rawHeaderValue) {
        return undefined
      }
      this.headers.set(headerName, parseHeader(headerName, rawHeaderValue))
    }
    return this.headers.get(headerName)
  }

  protected abstract getRawHeaderValue(headerName: HttpHeader): string
}

@Injectable(HttpRequestHeadersAccessor)
export class DandiHttpRequestHeadersAccessor extends HttpRequestHeadersAccessorBase {

  constructor(
    @Inject(HttpRequest) private readonly request: HttpRequest,
    @Inject(HttpRequestHeadersCache) headers: HttpRequestHeadersCache,
  ) {
    super(headers.getRequestCache(request))
  }

  protected getRawHeaderValue(headerName: HttpHeader): string {
    return this.request.get(headerName)
  }

}

export class HttpRequestHeadersHashAccessor extends HttpRequestHeadersAccessorBase {

  public static fromParsed(headers: HttpRequestHeaders): HttpRequestHeadersHashAccessor {
    return new HttpRequestHeadersHashAccessor({}, headers)
  }

  public static fromRaw(headers: HttpHeadersRaw): HttpRequestHeadersHashAccessor {
    return new HttpRequestHeadersHashAccessor(headers)
  }

  private constructor(private readonly rawHeaders: HttpHeadersRaw, parsedHeaders?: HttpRequestHeaders) {
    super(new Map<HttpRequestHeader, any>())

    if (rawHeaders) {
      Object.entries(rawHeaders).forEach(([headerName, value]) => {
        rawHeaders[headerName.toLocaleLowerCase()] = value
      })
    }

    if (parsedHeaders) {
      Object.entries(parsedHeaders).forEach(([headerName, value]: [HttpRequestHeader, any]) => {
        this.headers.set(headerName, value)
      })
    }
  }

  protected getRawHeaderValue(headerName: HttpHeader): string {
    return this.rawHeaders[headerName]
  }

}

import { Inject, Injectable, Optional, RestrictScope } from '@dandi/core'
import { HttpHeader, HttpMethod, HttpRequestScope, HttpResponseHeaders } from '@dandi/http'

import {
  CorsAllowCredentials,
  CorsAllowHeaders,
  CorsAllowMethods,
  CorsAllowOrigin,
  CorsExposeHeaders,
  CorsHeaders,
  CorsMaxAge,
} from './cors'

export type CorsSafelistHeaders = [
  HttpHeader.accept,
  HttpHeader.acceptLanguage,
  HttpHeader.contentLanguage,
  HttpHeader.contentType,
]
export const CORS_SAFELIST_HEADERS: CorsSafelistHeaders = [
  HttpHeader.accept,
  HttpHeader.acceptLanguage,
  HttpHeader.contentLanguage,
  HttpHeader.contentType,
]

export type CorsResponseHeaders = Pick<
  HttpResponseHeaders,
  | HttpHeader.accessControlAllowCredentials
  | HttpHeader.accessControlAllowHeaders
  | HttpHeader.accessControlAllowMethods
  | HttpHeader.accessControlAllowOrigin
  | HttpHeader.accessControlExposeHeaders
  | HttpHeader.accessControlMaxAge
>

export type CorsResponseHeader = keyof HttpResponseHeaders

@Injectable(RestrictScope(HttpRequestScope))
export class CorsHeaderValues implements Partial<CorsResponseHeaders> {
  constructor(
    @Inject(CorsAllowOrigin) @Optional() allowOrigin: string,
    @Inject(CorsAllowMethods) @Optional() allowMethods: HttpMethod[],
    @Inject(CorsAllowCredentials) @Optional() allowCredentials: true,
    @Inject(CorsAllowHeaders) @Optional() allowHeaders: CorsHeaders,
    @Inject(CorsExposeHeaders) @Optional() exposeHeaders: CorsHeaders,
    @Inject(CorsMaxAge) @Optional() maxAge: number,
  ) {
    const values: Partial<CorsResponseHeaders> = {}

    if (allowOrigin) {
      values[HttpHeader.accessControlAllowOrigin] = allowOrigin
    }
    if (allowMethods) {
      values[HttpHeader.accessControlAllowMethods] = allowMethods.join(', ')
    }
    if (allowCredentials) {
      values[HttpHeader.accessControlAllowCredentials] = allowCredentials
    }
    const normalizedAllowHeaders = [...new Set<string>((allowHeaders || []).concat(CORS_SAFELIST_HEADERS))]
    values[HttpHeader.accessControlAllowHeaders] = normalizedAllowHeaders.join(', ')
    if (exposeHeaders) {
      values[HttpHeader.accessControlExposeHeaders] = exposeHeaders.join(', ')
    }
    if (typeof maxAge !== 'undefined') {
      values[HttpHeader.accessControlMaxAge] = maxAge
    }

    Object.assign(this, values)
  }
}

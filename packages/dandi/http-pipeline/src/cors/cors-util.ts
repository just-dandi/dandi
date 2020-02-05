import { HttpHeader, HttpRequest, HttpRequestHeadersAccessor } from '@dandi/http'

import { CorsResponseHeaders } from './cors-headers'

export function corsRequestAllowed(corsHeaders: Partial<CorsResponseHeaders>, headers: HttpRequestHeadersAccessor): boolean {
  if (!corsHeaders[HttpHeader.accessControlAllowOrigin] || !corsHeaders[HttpHeader.accessControlAllowMethods]) {
    // no matching origin or allowed methods
    return false
  }

  const requestHeaders = headers.get(HttpHeader.accessControlRequestHeaders)
  const allowedHeaders = corsHeaders[HttpHeader.accessControlAllowHeaders]
  if (requestHeaders && requestHeaders.some(requestHeader => !allowedHeaders.includes(requestHeader))) {
    // at least one requested header missing from the response's allow headers
    return false
  }

  return true
}

export function isCorsRequest(req: HttpRequest): boolean {
    if (!req.get(HttpHeader.origin)) {
      return false
    }
    return req.get(HttpHeader.origin) !== req.get(HttpHeader.host)
}

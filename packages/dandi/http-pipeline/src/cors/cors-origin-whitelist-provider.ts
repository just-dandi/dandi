import { Provider } from '@dandi/core'
import { HttpHeader, HttpHeaderWildcard, HttpRequestHeadersAccessor } from '@dandi/http'

import { CorsAllowOrigin } from './cors'
import { CorsOriginWhitelist, CorsOriginWhitelistEntry } from './cors-origin-whitelist'

function checkWhitelistEntry(origin: string, entry: CorsOriginWhitelistEntry): string {
  if (entry === HttpHeaderWildcard || entry === origin) {
    return origin
  }

  if (entry instanceof RegExp && entry.test(origin)) {
    return origin
  }

  return undefined
}

function corsOriginWhitelistFactory(
  whitelist: CorsOriginWhitelist,
  headers: HttpRequestHeadersAccessor,
): CorsAllowOrigin {
  const origin = headers.get(HttpHeader.origin)

  if (!Array.isArray(whitelist)) {
    return checkWhitelistEntry(origin, whitelist)
  }

  for (const entry of whitelist) {
    const result = checkWhitelistEntry(origin, entry)
    if (result) {
      return result
    }
  }

  return undefined
}

export const CorsOriginWhitelistProvider: Provider<CorsAllowOrigin> = {
  provide: CorsAllowOrigin,
  useFactory: corsOriginWhitelistFactory,
  deps: [
    CorsOriginWhitelist,
    HttpRequestHeadersAccessor,
  ],
}

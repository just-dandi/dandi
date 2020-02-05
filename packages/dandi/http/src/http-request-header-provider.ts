import { InjectionToken, Provider, ScopeBehavior } from '@dandi/core'

import { HttpRequestHeader, HttpRequestHeaders } from './http-headers'
import { HttpRequestHeadersAccessor } from './http-request-headers-accessor'
import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'

const tokens = new Map<HttpRequestHeader, InjectionToken<any>>()
const providers = new Map<HttpRequestHeader, Provider<any>>()

export function requestHeaderToken<THeaderName extends HttpRequestHeader>(
  headerName: THeaderName,
): InjectionToken<HttpRequestHeaders[THeaderName]> {
  const existingToken = tokens.get(headerName)
  if (existingToken) {
    return existingToken
  }

  const token = localOpinionatedToken<HttpRequestHeaders[THeaderName]>(`HttpRequestHeader:${headerName}`, {
    multi: false,
    restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
  })
  tokens.set(headerName, token)
  return token
}

export function requestHeaderProvider<THeaderName extends HttpRequestHeader>(
  headerName: THeaderName,
): Provider<HttpRequestHeaders[THeaderName]> {
  const existingProvider = providers.get(headerName)
  if (existingProvider) {
    return existingProvider
  }

  const provider: Provider<HttpRequestHeaders[THeaderName]> = {
    provide: requestHeaderToken(headerName),
    useFactory: function requestHeaderFactory(headers: HttpRequestHeadersAccessor): HttpRequestHeaders[THeaderName] {
      return headers.get(headerName)
    },
    deps: [
      HttpRequestHeadersAccessor,
    ],
  }
  providers.set(headerName, provider)
  return provider
}

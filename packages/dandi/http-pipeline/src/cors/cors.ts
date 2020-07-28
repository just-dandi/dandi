import { HttpMethod, HttpRequestScope, HttpRequestHeader, HttpHeaderWildcard } from '@dandi/http'

import { localToken } from '../local-token'

export type CorsHeaders = (HttpRequestHeader | string | HttpHeaderWildcard)[]

export const CorsOrigin = localToken.opinionated<string>('CorsOrigin', {
  restrictScope: HttpRequestScope,
})
export type CorsAllowOrigin = string
export type CorsAllowOriginFn = (origin: string) => CorsAllowOrigin | Promise<CorsAllowOrigin>
export const CorsAllowOrigin = localToken.opinionated<string>('CorsAllowOrigin', {
  restrictScope: HttpRequestScope,
})

export const CorsExposeHeaders = localToken.opinionated<CorsHeaders>('CorsExposeHeaders', {
  restrictScope: HttpRequestScope,
})

export const CorsMaxAge = localToken.opinionated<number>('CorsMaxAge', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowCredentials = localToken.opinionated<true>('CorsAllowCredentials', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowMethods = localToken.opinionated<HttpMethod[]>('CorsAllowMethods', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowHeaders = localToken.opinionated<CorsHeaders>('CorsAllowHeaders', {
  restrictScope: HttpRequestScope,
})

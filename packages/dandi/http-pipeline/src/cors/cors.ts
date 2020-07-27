import { InjectionToken } from '@dandi/core'
import { HttpMethod, HttpRequestScope, HttpRequestHeader, HttpHeaderWildcard } from '@dandi/http'

import { localToken } from '../local-token'

export type CorsHeaders = (HttpRequestHeader | string | HttpHeaderWildcard)[]

export const CorsOrigin: InjectionToken<string> = localToken.opinionated<string>('CorsOrigin', {
  restrictScope: HttpRequestScope,
})
export type CorsAllowOrigin = string
export type CorsAllowOriginFn = (origin: string) => CorsAllowOrigin | Promise<CorsAllowOrigin>
export const CorsAllowOrigin: InjectionToken<string> = localToken.opinionated<string>('CorsAllowOrigin', {
  restrictScope: HttpRequestScope,
})

export const CorsExposeHeaders: InjectionToken<CorsHeaders> = localToken.opinionated<CorsHeaders>('CorsExposeHeaders', {
  restrictScope: HttpRequestScope,
})

export const CorsMaxAge: InjectionToken<number> = localToken.opinionated<number>('CorsMaxAge', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowCredentials: InjectionToken<true> = localToken.opinionated<true>('CorsAllowCredentials', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowMethods: InjectionToken<HttpMethod[]> = localToken.opinionated<HttpMethod[]>('CorsAllowMethods', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowHeaders: InjectionToken<CorsHeaders> = localToken.opinionated<CorsHeaders>('CorsAllowHeaders', {
  restrictScope: HttpRequestScope,
})

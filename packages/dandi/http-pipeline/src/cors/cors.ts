import { InjectionToken } from '@dandi/core'
import { HttpMethod, HttpRequestScope, HttpRequestHeader, HttpHeaderWildcard } from '@dandi/http'

import { localOpinionatedToken } from '../local-token'

export type CorsHeaders = (HttpRequestHeader | string | HttpHeaderWildcard)[]

export const CorsOrigin: InjectionToken<string> = localOpinionatedToken<string>('CorsOrigin', {
  restrictScope: HttpRequestScope,
})
export type CorsAllowOrigin = string
export type CorsAllowOriginFn = (origin: string) => CorsAllowOrigin | Promise<CorsAllowOrigin>
export const CorsAllowOrigin: InjectionToken<string> = localOpinionatedToken<string>('CorsAllowOrigin', {
  restrictScope: HttpRequestScope,
})

export const CorsExposeHeaders: InjectionToken<CorsHeaders> = localOpinionatedToken<CorsHeaders>('CorsExposeHeaders', {
  restrictScope: HttpRequestScope,
})

export const CorsMaxAge: InjectionToken<number> = localOpinionatedToken<number>('CorsMaxAge', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowCredentials: InjectionToken<true> = localOpinionatedToken<true>('CorsAllowCredentials', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowMethods: InjectionToken<HttpMethod[]> = localOpinionatedToken<HttpMethod[]>('CorsAllowMethods', {
  restrictScope: HttpRequestScope,
})

export const CorsAllowHeaders: InjectionToken<CorsHeaders> = localOpinionatedToken<CorsHeaders>('CorsAllowHeaders', {
  restrictScope: HttpRequestScope,
})

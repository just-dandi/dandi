import { HttpHeader } from './http-header'
import { HttpMethod } from './http-method'
import { MimeType } from './mime-type'
import { MimeTypeInfo } from './mime-type-info'

export interface HttpHeadersRaw {
  [name: string]: string
}

export type HttpHeaderWildcard = '*'
export const HttpHeaderWildcard: HttpHeaderWildcard = '*'

export enum ContentDisposition {
  attachment = 'attachment',
  formData = 'form-data',
  inline = 'inline',
}

export enum HttpAcceptRanges {
  bytes = 'bytes',
  none = 'none',
}

export enum HttpConnection {
  close = 'close',
  keepAlive = 'keep-alive',
}

export interface HttpContentType {
  boundary?: string
  contentType: MimeType
  charset?: string
}

export interface HttpContentDisposition {
  contentDisposition: ContentDisposition
  name?: string
  filename?: string
  'filename*'?: string
}

export interface HttpProxyAuthenticate {
  proxyAuthenticate: string
  realm?: string
}

export interface HttpWwwAuthenticate {
  httpWwwAuthenticate: string
  charset?: 'utf-8' | 'UTF-8'
  realm?: string
}

export interface HttpHeaders {
  [HttpHeader.accept]?: MimeTypeInfo[]
  [HttpHeader.acceptCharset]?: string
  [HttpHeader.acceptEncoding]?: string
  [HttpHeader.acceptLanguage]?: string
  [HttpHeader.acceptRanges]?: HttpAcceptRanges
  [HttpHeader.accessControlAllowCredentials]?: true
  // [HttpHeader.accessControlAllowHeaders]?: string | string[]
  [HttpHeader.accessControlAllowHeaders]?: string
  // TODO: add stringification for strongly typed response headers
  // [HttpHeader.accessControlAllowMethods]?: HttpMethod[]
  [HttpHeader.accessControlAllowMethods]?: string
  [HttpHeader.accessControlAllowOrigin]?: HttpHeaderWildcard | string
  [HttpHeader.accessControlExposeHeaders]?: string | string[]
  [HttpHeader.accessControlMaxAge]?: number
  [HttpHeader.accessControlRequestHeaders]?: HttpHeader[]
  [HttpHeader.accessControlRequestMethod]?: Omit<HttpMethod, HttpMethod.options>
  [HttpHeader.age]?: number
  [HttpHeader.allow]?: string[]
  [HttpHeader.authorization]?: string
  [HttpHeader.cacheControl]?: string
  [HttpHeader.clearSiteData]?: string
  [HttpHeader.connection]?: HttpConnection
  [HttpHeader.contentDisposition]?: HttpContentDisposition
  [HttpHeader.contentEncoding]?: string
  [HttpHeader.contentLanguage]?: number
  [HttpHeader.contentLength]?: number
  [HttpHeader.contentLocation]?: string
  [HttpHeader.contentRange]?: string
  [HttpHeader.contentSecurityPolicy]?: string
  [HttpHeader.contentSecurityPolicyReportOnly]?: string
  [HttpHeader.contentType]?: HttpContentType | MimeType
  [HttpHeader.cookie]?: string
  [HttpHeader.crossOriginEmbedderPolicy]?: string
  [HttpHeader.crossOriginOpenerPolicy]?: string
  [HttpHeader.crossOriginResourcePolicy]?: string
  [HttpHeader.dnt]?: boolean
  [HttpHeader.eTag]?: string
  [HttpHeader.expect]?: '100-continue'
  [HttpHeader.expectCt]?: string
  [HttpHeader.expires]?: string
  [HttpHeader.featurePolicy]?: string
  [HttpHeader.host]?: string
  [HttpHeader.ifMatch]?: string
  [HttpHeader.ifNoneMatch]?: string
  [HttpHeader.ifModifiedSince]?: string
  [HttpHeader.ifRange]?: string
  [HttpHeader.ifUnmodifiedSince]?: string
  [HttpHeader.keepAlive]?: string
  [HttpHeader.lastModified]?: string
  [HttpHeader.location]?: string
  [HttpHeader.origin]?: string
  [HttpHeader.pragma]?: 'no-cache'
  [HttpHeader.proxyAuthenticate]?: HttpProxyAuthenticate
  [HttpHeader.proxyAuthorization]?: string
  [HttpHeader.publicKeyPins]?: string
  [HttpHeader.publicKeyPinsReportOnly]?: string
  [HttpHeader.range]?: string
  [HttpHeader.referer]?: string
  [HttpHeader.secFetchDest]?: string
  [HttpHeader.secFetchMode]?: string
  [HttpHeader.secFetchSite]?: string
  [HttpHeader.secFetchUser]?: string
  [HttpHeader.server]?: string
  [HttpHeader.setCookie]?: string
  [HttpHeader.strictTransportSecurity]?: string
  [HttpHeader.timingAllowOrigin]?: string
  [HttpHeader.tk]?: string
  [HttpHeader.upgradeInsecureRequests]?: string
  [HttpHeader.userAgent]?: string
  [HttpHeader.vary]?: string
  [HttpHeader.warning]?: string
  // [HttpHeader.wwwAuthenticate]?: HttpWwwAuthenticate
  [HttpHeader.wwwAuthenticate]?: string
  [HttpHeader.xContentTypeOptions]?: string
  [HttpHeader.xDownloadOptions]?: string
  [HttpHeader.xFrameOptions]?: string
  [HttpHeader.xPermittedCrossDomainPolicies]?: string
  [HttpHeader.xPoweredBy]?: string
  [HttpHeader.xXssProtection]?: string
}

export type HttpRequestHeaders = Pick<
  HttpHeaders,
  | HttpHeader.accept
  | HttpHeader.acceptCharset
  | HttpHeader.acceptEncoding
  | HttpHeader.acceptLanguage
  | HttpHeader.accessControlRequestHeaders
  | HttpHeader.accessControlRequestMethod
  | HttpHeader.authorization
  | HttpHeader.cacheControl
  | HttpHeader.connection
  | HttpHeader.contentDisposition
  | HttpHeader.contentLanguage
  | HttpHeader.contentLength
  | HttpHeader.contentType
  | HttpHeader.cookie
  | HttpHeader.dnt
  | HttpHeader.expect
  | HttpHeader.host
  | HttpHeader.ifMatch
  | HttpHeader.ifModifiedSince
  | HttpHeader.ifNoneMatch
  | HttpHeader.ifRange
  | HttpHeader.ifUnmodifiedSince
  | HttpHeader.keepAlive
  | HttpHeader.pragma
  | HttpHeader.origin
  | HttpHeader.range
  | HttpHeader.referer
  | HttpHeader.secFetchDest
  | HttpHeader.secFetchMode
  | HttpHeader.secFetchSite
  | HttpHeader.secFetchUser
  | HttpHeader.upgradeInsecureRequests
  | HttpHeader.userAgent
  | HttpHeader.warning
> & {
  [HttpHeader.contentType]?: HttpContentType
}
export type HttpRequestHeader = keyof HttpRequestHeaders

export type HttpResponseHeaders = Pick<
  HttpHeaders,
  | HttpHeader.accessControlAllowCredentials
  | HttpHeader.accessControlAllowHeaders
  | HttpHeader.accessControlAllowMethods
  | HttpHeader.accessControlAllowOrigin
  | HttpHeader.accessControlExposeHeaders
  | HttpHeader.accessControlMaxAge
  | HttpHeader.age
  | HttpHeader.allow
  | HttpHeader.cacheControl
  | HttpHeader.clearSiteData
  | HttpHeader.connection
  | HttpHeader.contentDisposition
  | HttpHeader.contentEncoding
  | HttpHeader.contentLanguage
  | HttpHeader.contentLength
  | HttpHeader.contentLocation
  | HttpHeader.contentRange
  | HttpHeader.contentSecurityPolicy
  | HttpHeader.contentSecurityPolicyReportOnly
  | HttpHeader.contentType
  | HttpHeader.crossOriginEmbedderPolicy
  | HttpHeader.crossOriginOpenerPolicy
  | HttpHeader.crossOriginResourcePolicy
  | HttpHeader.expectCt
  | HttpHeader.expires
  | HttpHeader.eTag
  | HttpHeader.featurePolicy
  | HttpHeader.keepAlive
  | HttpHeader.lastModified
  | HttpHeader.location
  | HttpHeader.pragma
  | HttpHeader.proxyAuthenticate
  | HttpHeader.publicKeyPins
  | HttpHeader.publicKeyPinsReportOnly
  | HttpHeader.server
  | HttpHeader.setCookie
  | HttpHeader.strictTransportSecurity
  | HttpHeader.timingAllowOrigin
  | HttpHeader.tk
  | HttpHeader.vary
  | HttpHeader.warning
  | HttpHeader.wwwAuthenticate
  | HttpHeader.xContentTypeOptions
  | HttpHeader.xDownloadOptions
  | HttpHeader.xFrameOptions
  | HttpHeader.xPermittedCrossDomainPolicies
  | HttpHeader.xPoweredBy
  | HttpHeader.xXssProtection
> & {
  [HttpHeader.contentType]?: MimeType
}

export type HttpResponseHeader = keyof HttpResponseHeaders

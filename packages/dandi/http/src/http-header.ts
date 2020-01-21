export enum HttpHeader {

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept
   */
  accept = 'accept',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset
   */
  acceptCharset = 'accept-charset',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding
   */
  acceptEncoding = 'accept-encoding',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
   */
  acceptLanguage = 'accept-language',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Ranges
   */
  acceptRanges = 'accept-ranges',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
   */
  accessControlAllowCredentials = 'access-control-allow-credentials',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
   */
  accessControlAllowHeaders = 'access-control-allow-headers',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods
   */
  accessControlAllowMethods = 'access-control-allow-methods',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
   */
  accessControlAllowOrigin = 'access-control-allow-origin',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
   */
  accessControlExposeHeaders = 'access-control-expose-headers',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
   */
  accessControlMaxAge = 'access-control-max-age',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Headers
   */
  accessControlRequestHeaders = 'access-control-request-headers',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Method
   */
  accessControlRequestMethod = 'access-control-request-method',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Age
   */
  age = 'age',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow
   */
  allow = 'allow',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
   */
  authorization = 'authorization',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
   */
  cacheControl = 'cache-control',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data
   */
  clearSiteData = 'clear-site-data',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Connection
   */
  connection = 'connection',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
   */
  contentDisposition = 'content-disposition',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
   */
  contentEncoding = 'content-encoding',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language
   */
  contentLanguage = 'content-language',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length
   */
  contentLength = 'content-length',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Location
   */
  contentLocation = 'content-location',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range
   */
  contentRange = 'content-range',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
   */
  contentSecurityPolicy = 'content-security-policy',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only
   */
  contentSecurityPolicyReportOnly = 'content-security-policy-report-only',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
   */
  contentType = 'content-type',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie
   */
  cookie = 'cookie',

  /**
   * Allows a server to declare an embedder policy for a given document.
   */
  crossOriginEmbedderPolicy = 'cross-origin-embedder-policy',

  /**
   * Prevents other domains from opening/controlling a window.
   */
  crossOriginOpenerPolicy = 'cross-origin-opener-policy',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy
   */
  crossOriginResourcePolicy = 'cross-origin-resource-policy',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/DNT
   */
  dnt = 'dnt',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
   */
  eTag = 'etag',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect
   */
  expect = 'expect',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT
   */
  expectCt = 'expect-ct',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
   */
  expires = 'expires',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
   */
  featurePolicy = 'feature-policy',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host
   */
  host = 'host',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match
   */
  ifMatch = 'if-match',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
   */
  ifNoneMatch = 'if-none-match',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since
   */
  ifModifiedSince = 'if-modified-since',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Range
   */
  ifRange = 'if-range',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Unmodified-Since
   */
  ifUnmodifiedSince = 'if-unmodified-since',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive
   */
  keepAlive = 'keep-alive',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified
   */
  lastModified = 'last-modified',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location
   */
  location = 'location',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin
   */
  origin = 'origin',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma
   */
  pragma = 'pragma',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Proxy-Authenticate
   */
  proxyAuthenticate = 'proxy-authenticate',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Proxy-Authorization
   */
  proxyAuthorization = 'proxy-authorization',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Public-Key-Pins
   */
  publicKeyPins = 'public-key-pins',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Public-Key-Pins-Report-Only
   */
  publicKeyPinsReportOnly = 'public-key-pins-report-only',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
   */
  range = 'range',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer
   */
  referer = 'referer',

  /**
   * https://www.w3.org/TR/fetch-metadata/#sec-fetch-dest-header
   */
  secFetchDest = 'sec-fetch-dest',

  /**
   * https://www.w3.org/TR/fetch-metadata/#sec-fetch-mode-header
   */
  secFetchMode = 'sec-fetch-mode',

  /**
   * https://www.w3.org/TR/fetch-metadata/#sec-fetch-site-header
   */
  secFetchSite = 'sec-fetch-site',

  /**
   * https://www.w3.org/TR/fetch-metadata/#sec-fetch-user-header
   */
  secFetchUser = 'sec-fetch-user',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server
   */
  server = 'server',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
   */
  setCookie = 'set-cookie',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
   */
  strictTransportSecurity = 'strict-transport-security',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin
   */
  timingAllowOrigin = 'timingAllowOrigin',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/TK
   */
  tk = 'tk',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Upgrade-Insecure-Requests
   */
  upgradeInsecureRequests = 'upgrade-insecure-requests',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
   */
  userAgent = 'user-agent',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary
   */
  vary = 'vary',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning
   */
  warning = 'warning',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate
   */
  wwwAuthenticate = 'www-authenticate',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
   */
  xContentTypeOptions = 'x-content-type-options',

  /**
   * The X-Download-Options HTTP header indicates that the browser (Internet Explorer) should not display the option to
   * "Open" a file that has been downloaded from an application, to prevent phishing attacks as the file otherwise would
   * gain access to execute in the context of the application.
   */
  xDownloadOptions = 'x-download-options',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
   */
  xFrameOptions = 'x-frame-options',

  /**
   * Specifies if a cross-domain policy file (crossdomain.xml) is allowed. The file may define a policy to grant
   * clients, such as Adobe's Flash Player, Adobe Acrobat, Microsoft Silverlight, or Apache Flex, permission to handle
   * data across domains that would otherwise be restricted due to the Same-Origin Policy. See the Cross-domain Policy
   * File Specification for more information.
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#Request_context
   */
  xPermittedCrossDomainPolicies = 'x-permitted-cross-domain-policies',

  /**
   * May be set by hosting environments or other frameworks and contains information about them while not providing any
   * usefulness to the application or its visitors. Unset this header to avoid exposing potential vulnerabilities.
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#Request_context
   */
  xPoweredBy = 'x-powered-by',

  /**
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
   */
  xXssProtection = 'x-xss-protection',
}

export const HttpHeaderLookup: { [key: string]: HttpHeader } =
  [...Object.entries(HttpHeader)].reduce((result, [key, value]) => {
    result[value] = key
    return result
  }, {})

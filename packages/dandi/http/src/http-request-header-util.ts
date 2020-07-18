import { HttpHeader, HttpHeaderLookup } from './http-header'
import { HttpHeadersRaw, HttpRequestHeader, HttpRequestHeaders } from './http-headers'
import { parseMimeTypes } from './mime-type-util'

interface HeaderParser<THeaderName extends HttpRequestHeader> {
  (rawValue: string): HttpRequestHeaders[THeaderName]
}

type HeaderParsers = { [THeaderName in HttpRequestHeader]?: HeaderParser<THeaderName> }

const directiveHeaders: HttpHeader[] = [HttpHeader.contentDisposition, HttpHeader.contentType]

function commaSeparatedToken<T extends string>(rawValue: string): T[] {
  return rawValue.split(/\s*,\s*/) as T[]
}

function commaSeparatedTokenToLower<T extends string>(rawValue: string): T[] {
  return commaSeparatedToken<T>(rawValue).map((token) => token.toLocaleLowerCase()) as T[]
}

const headerParsers: HeaderParsers = {
  /*
   * TODO:
   *  - accept-charset: quality weighting directives - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset
   *  - accept-encoding: quality weighting directives - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding
   *  - accept-language: quality weighting directives - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
   *  - authorization: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
   *  - cache-control: directives only - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
   *    - similar to directives, but with no leading value - can probably adapt existing directive header parser
   *  - clear-site-data: directives only https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data
   *  - content-encoding: comma separated array - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
   *  - expires: date parse from HTTP date - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires
   *  - if-match: comma-separated values - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match
   *  - if-none-match: comma-separate values - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
   *  - if-modified-since: HTTP date? https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since
   *  - if-unmodified-since: HTTP date? https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Unmodified-Since
   *  - keep-alive: directives only - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive
   *  - last-modified: HTTP date? https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified
   *  - proxy-authorization: same as authorization - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Proxy-Authorization
   *  - vary: comma-separated values - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary
   *  - warning: ordered directives - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning
   */

  [HttpHeader.accept]: (rawValue: string) => parseMimeTypes(rawValue),
  [HttpHeader.accessControlRequestHeaders]: commaSeparatedTokenToLower,
  [HttpHeader.dnt]: (rawValue: string) => Number(rawValue) === 1,
}

export interface RawHeader<THeaderName extends HttpHeader = any> {
  /**
   * The name of the header, forced to lowercase
   */
  name: THeaderName

  /**
   * The raw header value, including any directives
   */
  rawValue: string
}

/**
 * @internal
 */
export interface ParsedHeaderAndDirectives {
  value: string
  directives?: { [key: string]: string }
}

export interface ParsedHeader<THeaderName extends HttpRequestHeader> {
  name: THeaderName
  value: HttpRequestHeaders[THeaderName]
}

/**
 * Takes the full line of a header, including the name, and returns a {@link RawHeader}.
 */
export function splitRawHeader(rawHeader: string): RawHeader {
  const [name, rawValue] = rawHeader.split(/:\s*/)
  return { name: name.toLocaleLowerCase(), rawValue }
}

/**
 * @internal
 *
 * Provides the standard implementation for parsing header values that consist of a string value, and possibly one or
 * more directives.
 */
export function parseDirectiveHeaderValue(rawValue: string): ParsedHeaderAndDirectives {
  const [value, ...rawDirectives] = rawValue.split(/;\s*/)

  if (!rawDirectives.length) {
    return { value }
  }
  const directives = rawDirectives.reduce((result, rawDirective) => {
    const [name, quotedValue] = rawDirective.split('=')
    result[name] = quotedValue.startsWith('"') ? quotedValue.substring(1, quotedValue.length - 1) : quotedValue
    return result
  }, {})

  return { value, directives }
}

/**
 * @internal
 *
 * Provides the standard implementation for parsing headers that consist of a string value, and possibly one or
 * more directives, and returning the header-specific object described in the documentation for {@link parseHeader}.
 */
export function parseDirectiveHeader<THeaderName extends HttpRequestHeader>(
  headerName: THeaderName,
  rawValue: string,
): HttpRequestHeaders[THeaderName] {
  const header = parseDirectiveHeaderValue(rawValue)
  const key = HttpHeaderLookup[headerName]
  return Object.assign(
    {
      [key]: header.value,
    },
    header.directives,
  ) as any
}

/**
 * Parses the header value into a header-specific object.
 *
 * Most headers will have an object representation that includes the base header value at a key that is the camelCased
 * version of the header name, plus additional keys for any directives. For example:
 *
 *   content-type: application/json; charset=utf-8
 *
 * Would be represented as :
 *
 *   {
 *     contentType: 'application/json',
 *     charset: 'utf-8',
 *   }
 *
 * However, some headers, such as Accept are more complex, and have their own special object format. Using Accept as an
 * example, it is parsed into an array of {@link MimeTypeInfo} objects.
 */
export function parseHeader<THeaderName extends HttpRequestHeader>(
  headerName: THeaderName,
  rawValue: string,
): HttpRequestHeaders[THeaderName] {
  const normalizedName = headerName.toLocaleLowerCase()
  const parser =
    headerParsers[normalizedName] ||
    (directiveHeaders.includes(headerName) && parseDirectiveHeader.bind(undefined, normalizedName)) ||
    String
  return parser(rawValue)
}

function reduceHeaders(headers: HttpRequestHeaders, header: ParsedHeader<any>): HttpRequestHeaders {
  headers[header.name] = header.value
  return headers
}

/**
 * @internal
 */
export function parseRawHeader<THeaderName extends HttpRequestHeader>(
  rawHeader: RawHeader<THeaderName>,
): ParsedHeader<THeaderName> {
  const { name } = rawHeader
  const value = parseHeader(name, rawHeader.rawValue)
  return { name, value }
}

/**
 * Parses an array of raw header strings into an {@link HttpHeaders} object.
 *
 * See {@link parseHeader} for more information about the header-specific objects.
 */
export function parseHeaders(lines: string[]): HttpRequestHeaders {
  return lines
    .map(splitRawHeader)
    .map(parseRawHeader)
    .reduce(reduceHeaders, {} as HttpRequestHeaders)
}

export function parseHeadersFromObject(rawHeaders: HttpHeadersRaw): HttpRequestHeaders {
  return [...Object.entries(rawHeaders || {})].reduce((headers, [headerName, headerValue]) => {
    const normalizedName = headerName.toLocaleLowerCase() as HttpRequestHeader
    headers[normalizedName] = parseHeader(normalizedName, headerValue)
    return headers
  }, {})
}

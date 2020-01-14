import { HttpHeader, HttpHeaderLookup } from './http-header'
import { HttpHeaders, HttpHeadersStrict } from './http-headers'
import { parseMimeTypes } from './mime-type'

interface HeaderParser<THeaderName extends HttpHeader> {
  (rawValue: string): HttpHeadersStrict[THeaderName]
}

type HeaderParsers = { [THeaderName in HttpHeader]?: HeaderParser<THeaderName> }

const headerParsers: HeaderParsers = {
  [HttpHeader.accept]: (rawValue: string) => parseMimeTypes(rawValue),
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
export interface ParsedHeaderValue {
  value: string
  directives?: { [key: string]: string }
}

export interface ParsedHeader<THeaderName extends HttpHeader> {
  name: THeaderName
  value: HttpHeadersStrict[THeaderName]
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
export function standardParseHeaderValue(rawValue: string): ParsedHeaderValue {
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
export function standardParseHeader<THeaderName extends HttpHeader>(
  headerName: THeaderName,
  rawValue: string,
): HttpHeadersStrict[THeaderName] {
  const header = standardParseHeaderValue(rawValue)
  const key = HttpHeaderLookup[headerName]
  return Object.assign({
    [key]: header.value,
  }, header.directives) as any
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
export function parseHeader<THeaderName extends HttpHeader>(
  headerName: THeaderName,
  rawValue: string,
): HttpHeadersStrict[THeaderName] {
  const parser = headerParsers[headerName] || standardParseHeader.bind(undefined, headerName)
  return parser(rawValue)
}

function reduceHeaders(headers: HttpHeaders, header: ParsedHeader<any>): HttpHeaders {
  headers[header.name] = header.value
  return headers
}

/**
 * @internal
 */
export function parseRawHeader<THeaderName extends HttpHeader>(
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
export function parseHeaders(lines: string[]): HttpHeaders {
  return lines
    .map(splitRawHeader)
    .map(parseRawHeader)
    .reduce(reduceHeaders, {} as HttpHeaders)
}

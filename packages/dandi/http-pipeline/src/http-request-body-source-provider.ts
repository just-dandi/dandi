import { Provider } from '@dandi/core'
import { HttpRequestHeadersAccessor, HttpRequestBodySource, HttpRequestRawBody, HttpHeader } from '@dandi/http'

import { HttpBodyParser } from './body-parsing/http-body-parser'
import { NoConfiguredParserError } from './body-parsing/no-configured-parser-error'

async function httpRequestBodySourceFactory(
  parser: HttpBodyParser,
  body: string | Buffer,
  headers: HttpRequestHeadersAccessor,
): Promise<string | object> {
  if (!parser) {
    throw new NoConfiguredParserError(headers.get(HttpHeader.contentType)?.contentType)
  }
  return parser.parseBody(body, headers)
}

export const HttpRequestBodySourceProvider: Provider<string | object> = {
  provide: HttpRequestBodySource,
  useFactory: httpRequestBodySourceFactory,
  deps: [
    HttpBodyParser,
    HttpRequestRawBody,
    HttpRequestHeadersAccessor,
  ],
  async: true,
}

import { HttpRequestHeadersAccessor, MimeType } from '@dandi/http'

import { BodyParser } from './body-parser-decorator'
import { HttpBodyParserBase } from './http-body-parser-base'

@BodyParser(MimeType.any, MimeType.unknown)
export class PassThroughBodyParser extends HttpBodyParserBase {
  constructor() {
    super()
  }

  protected parseBodyFromString(body: any, headers?: HttpRequestHeadersAccessor): string | object | Promise<object> {
    return body
  }
}

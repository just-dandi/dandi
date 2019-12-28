import { MimeTypes } from '@dandi/http'

import { BodyParser } from './body-parser-decorator'
import { HttpBodyParserBase } from './http-body-parser-base'

@BodyParser(MimeTypes.textPlain)
export class PlainTextBodyParser extends HttpBodyParserBase {

  constructor() {
    super()
  }

  protected parseBodyFromString(body: string): string {
    return body
  }

}

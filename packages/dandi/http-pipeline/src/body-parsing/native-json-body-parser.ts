import { MimeType } from '@dandi/http'

import { BodyParser } from './body-parser-decorator'
import { HttpBodyParserBase } from './http-body-parser-base'

@BodyParser(MimeType.applicationJson)
export class NativeJsonBodyParser extends HttpBodyParserBase {
  constructor() {
    super()
  }

  protected parseBodyFromString(body: string): object {
    return JSON.parse(body)
  }
}

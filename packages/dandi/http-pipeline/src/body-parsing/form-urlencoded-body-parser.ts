import { MimeType } from '@dandi/http'

import { BodyParser } from './body-parser-decorator'
import { HttpBodyParserBase } from './http-body-parser-base'

export interface FormUrlencodedBodyResult {
  [key: string]: string | string[]
}

/**
 * A simple implementation that parses bodies from application/x-www-form-urlencoded. It supports converting duplicate
 * keys to array values, but does not support any other complex object formatting, such as dot notation (foo.bar=value)
 * or indexed keys (foo[0]=bar or foo[]=bar). The resulting object will be a {@link FormUrlencodedBodyResult}.
 */
@BodyParser(MimeType.applicationFormUrlencoded)
export class FormUrlencodedBodyParser extends HttpBodyParserBase {

  constructor() {
    super()
  }

  protected parseBodyFromString(body: string): FormUrlencodedBodyResult {
    return body
      .split('&')
      .reduce((result, entry) => {
        const [key, rawValue] = entry.split('=')
        const value = decodeURIComponent(rawValue)
        if (result[key]) {
          if (Array.isArray(result[key])) {
            result[key].push(value)
          } else {
            result[key] = [result[key], value]
          }
        } else {
          result[key] = value
        }
        return result
      }, {})
  }

}

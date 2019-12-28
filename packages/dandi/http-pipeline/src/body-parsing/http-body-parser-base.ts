import { Constructor } from '@dandi/common'
import { HttpRequestHeaders, MimeTypeInfo } from '@dandi/http'

import { getBodyParserMetadata } from './body-parser-decorator'
import { HttpBodyParser } from './http-body-parser'

export abstract class HttpBodyParserBase implements HttpBodyParser {

  public readonly parseableTypes: MimeTypeInfo[]

  protected constructor() {
    this.parseableTypes = getBodyParserMetadata(this.constructor as Constructor<HttpBodyParser>).contentTypes
  }

  public parseBody(body: string | Buffer, headers: HttpRequestHeaders): string | object | Promise<object> {
    const source = typeof body === 'string' ?
      body :
      body.toString('utf-8') // TODO: check encoding headers
    return this.parseBodyFromString(source, headers)
  }

  protected abstract parseBodyFromString(body: string, headers?: HttpRequestHeaders): string | object | Promise<object>

}

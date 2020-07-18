import { Constructor, isPromise } from '@dandi/common'
import {
  ContentDisposition,
  HttpContentDisposition,
  HttpHeader,
  HttpRequestHeadersAccessor,
  MimeTypeInfo,
} from '@dandi/http'

import { getBodyParserMetadata } from './body-parser-decorator'
import { HttpBodyParser } from './http-body-parser'

export abstract class HttpBodyParserBase implements HttpBodyParser {
  public readonly parseableTypes: MimeTypeInfo[]

  protected constructor() {
    this.parseableTypes = getBodyParserMetadata(this.constructor as Constructor<HttpBodyParser>).contentTypes
  }

  public parseBody(body: string | Buffer, headers: HttpRequestHeadersAccessor): string | object | Promise<object> {
    const source =
      typeof body === 'string' ? body : body.toString(headers.get(HttpHeader.contentType)?.charset || 'utf-8') // TODO: add config for default
    const parsedBody = this.parseBodyFromString(source, headers)
    const disposition = headers.get(HttpHeader.contentDisposition)
    if (disposition?.contentDisposition !== ContentDisposition.formData || !disposition?.name) {
      return parsedBody
    }
    if (isPromise(parsedBody)) {
      return parsedBody.then(this.composeFromDisposition.bind(this, disposition))
    }
    return this.composeFromDisposition(disposition, parsedBody)
  }

  protected abstract parseBodyFromString(
    body: string,
    headers?: HttpRequestHeadersAccessor,
  ): string | object | Promise<object>

  private composeFromDisposition(disposition: HttpContentDisposition, parsedBody: string | object): object {
    return {
      [disposition.name]: parsedBody,
    }
  }
}

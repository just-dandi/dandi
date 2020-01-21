import { Inject, Injectable, InjectionScope, Injector, Provider, RestrictScope, ScopeBehavior } from '@dandi/core'
import {
  HttpHeader,
  HttpHeaders,
  HttpRequestBodySource,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
  HttpRequestRawBody,
  HttpRequestScope,
  MimeType,
  parseHeaders,
} from '@dandi/http'

import { BodyParser } from './body-parser-decorator'
import { FormMultipartMissingBoundaryError } from './form-multipart-errors'
import { HttpBodyParserBase } from './http-body-parser-base'

interface PreppedPart {
  contentSource: string
  headers: HttpHeaders,
}

@BodyParser(MimeType.multipartFormData)
// must use ScopeBehavior.perInjector so that the correct Injector instance can be injected
@Injectable(RestrictScope(ScopeBehavior.perInjector(HttpRequestScope)))
export class FormMultipartBodyParser extends HttpBodyParserBase {

  constructor(@Inject(Injector) private injector: Injector) {
    super()
  }

  protected async parseBodyFromString(body: string, headers: HttpRequestHeadersAccessor): Promise<object> {
    const contentType = headers.get(HttpHeader.contentType)
    if (!contentType.boundary) {
      throw new FormMultipartMissingBoundaryError()
    }

    const parts = body.split(`--${contentType.boundary}`)

    // last part is the "epilogue" and can be ignored https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
    parts.pop()
    const results = await Promise.all(parts.map(async part => {
      const preppedPart: PreppedPart = this.prepPart(part.trim())
      if (!preppedPart) {
        return undefined
      }
      const partScope: InjectionScope = class FormMultiPartBodyParsingScope {}
      const partInjector = this.injector.createChild(partScope, [
        {
          provide: HttpRequestRawBody,
          useValue: preppedPart.contentSource,
        },
        {
          provide: HttpRequestHeadersAccessor,
          useValue: HttpRequestHeadersHashAccessor.fromParsed(preppedPart.headers),
        } as Provider<HttpRequestHeadersAccessor>,
      ])

      // recursively use the parser system to parse the individual parts
      return (await partInjector.inject(HttpRequestBodySource)).singleValue
    }))

    // FIXME: this won't support multiple parts of the same name, like arrays of files
    return results
      .filter(result => !!result)
      .reduce((result, part) => {
        return Object.assign(result, part as any)
      }, {})
  }

  private prepPart(source: string): PreppedPart {
    const sourceParts = source.split(/\r?\n\r?\n/)
    if (sourceParts.length === 1) {
      sourceParts.unshift('')
    }
    const [headersPart, contentSource] = sourceParts
    if (!contentSource) {
      return undefined
    }
    const headerLines = headersPart.split(/\r?\n/)
    const headers = parseHeaders(headerLines)
    if (!headers[HttpHeader.contentType]) {
      headers[HttpHeader.contentType] = { contentType: MimeType.textPlain }
    }

    return {
      contentSource,
      headers,
    }
  }

}

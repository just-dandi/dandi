import { EOL } from 'os'

import { Inject, Injector } from '@dandi/core'
import { HttpRequestHeaders, HttpRequestRawBody, MimeTypes, HttpRequestBodySource } from '@dandi/http'

import { BodyParser } from './body-parser-decorator'
import { HttpBodyParserBase } from './http-body-parser-base'
import { localOpinionatedToken } from '../local-token'

const BOUNDARY = 'boundary='
const CONTENT_TYPE_PREFIX = 'content-type:'

const PartSource = localOpinionatedToken<string>('FormMultipartBodyParser:PartSource', {
  multi: false,
  singleton: false,
})

interface PreppedPart {
  contentType: string
  source: string
}

@BodyParser(MimeTypes.multipartFormData)
export class FormMultipartBodyParser extends HttpBodyParserBase {

  constructor(@Inject(Injector) private injector: Injector) {
    super()
  }

  protected async parseBodyFromString(body: string, headers: HttpRequestHeaders): Promise<object> {
    const contentType = headers['Content-Type']
    const boundaryStart = contentType.indexOf(BOUNDARY)
    if (boundaryStart < 0) {
      throw new Error('no boundary')
    }

    const boundary = contentType.substring(boundaryStart + BOUNDARY.length)
    const parts = body.split(`--${boundary}`)

    // last part is the "epilogue" and can be ignored https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
    parts.pop()
    const result = await Promise.all(parts.map(async part => {
      const preppedPart: PreppedPart = await this.injector.invoke(this as FormMultipartBodyParser, 'prepPart', {
        provide: PartSource,
        useValue: part.trim(),
      })
      // recursively use the parser system to parse the individual parts
      return await this.injector.inject(HttpRequestBodySource,
        {
          provide: HttpRequestRawBody,
          useValue: preppedPart.source,
        },
        {
          provide: HttpRequestHeaders,
          useValue: {
            'Content-Type': preppedPart.contentType,
          },
        },
      )
    }))
    if (result.length === 0) {
      return undefined
    }
    if (result.length === 1) {
      return [result]
    }
    return result
  }

  public prepPart(@Inject(PartSource) source: string): PreppedPart {
    const firstLineBreak = source.indexOf(EOL)
    const firstLine = source
      .substring(0, firstLineBreak)
      .toLocaleLowerCase()
      .trim()
    const hasContentType = firstLine.startsWith(CONTENT_TYPE_PREFIX)
    const contentType = hasContentType ? firstLine.substring(CONTENT_TYPE_PREFIX.length) : MimeTypes.textPlain
    const partContent = hasContentType ? source.substring(firstLineBreak + 1) : source

    return {
      contentType,
      source: partContent,
    }
  }

}

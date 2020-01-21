import { testHarness, TestInjector, stub } from '@dandi/core/testing'
import {
  ContentDisposition,
  createHttpRequestScope,
  HttpHeader,
  HttpHeaders,
  HttpRequest,
  HttpRequestHeader,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
  MimeType,
} from '@dandi/http'
import {
  BodyParserInfoProvider,
  FormMultipartBodyParser,
  FormMultipartMissingBoundaryError,
  HttpBodyParserCacheProvider,
  HttpBodyParserProvider,
  HttpRequestBodySourceProvider,
  NativeJsonBodyParser,
  PlainTextBodyParser,
} from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('FormMultipartBodyParser', () => {

  const BOUNDARY = '****TEST_BOUNDARY****'

  interface Part {
    name: string
    headers?: {}
    content: string
  }

  function makeBody(...parts: (string | Part)[]): string {
    return parts
      .map(part => {
        if (typeof part === 'string') {
          return part
        }
        const headers = Object.assign({
          [HttpHeader.contentDisposition]: `${ContentDisposition.formData}; name="${part.name}"`,
        }, part.headers)

        const headersContent = Object.keys(headers)
          .reduce((result, headerName) => {
            const content = `${headerName}: ${headers[headerName]}`
            return result ? [result, content].join('\r\n') : content
          }, '')

        return [headersContent, part.content].join('\r\n\r\n')
      })
      .concat('**epilogue**')
      .join(`--${BOUNDARY}`)
  }

  const harness = testHarness(FormMultipartBodyParser,
    BodyParserInfoProvider,
    NativeJsonBodyParser,
    PlainTextBodyParser,
    HttpBodyParserCacheProvider,
    HttpBodyParserProvider,
    HttpRequestBodySourceProvider,
    {
      provide: HttpRequest,
      useFactory: () => req,
    },
  )

  let headersSource: HttpHeaders
  let headers: HttpRequestHeadersAccessor
  let req: HttpRequest
  let requestInjector: TestInjector
  let body: string
  let parser: FormMultipartBodyParser

  beforeEach(async () => {
    headersSource = {
      [HttpHeader.contentType]: { contentType: MimeType.multipartFormData, boundary: BOUNDARY },
    }
    headers = HttpRequestHeadersHashAccessor.fromParsed(headersSource)
    req = {
      get: (name: HttpRequestHeader) => headers.get(name),
    } as HttpRequest
    requestInjector = harness.createChild(createHttpRequestScope(req))
    parser = await requestInjector.inject(FormMultipartBodyParser)
  })
  afterEach(() => {
    headersSource = undefined
    headers = undefined
    req = undefined
    requestInjector = undefined
    body = undefined
    parser = undefined
  })

  describe('parseBody', () => {

    it('successfully parses a multipart body with a single part', async () => {
      body = makeBody({ name: 'foo', content: 'bar' })

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar' })
    })

    it('successfully parses a multipart body with two parts', async () => {
      body = makeBody(
        { name: 'foo', content: 'bar' },
        { name: 'bleep', content: 'bloop' },
      )

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar', bleep: 'bloop' })
    })

    it('ignores empty part with empty content', async () => {
      body = makeBody(
        { name: 'foo', content: 'bar' },
        '',
        { name: 'bleep', content: 'bloop' },
      )

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar', bleep: 'bloop' })
    })

    it('can parse parts with specific content types', async () => {
      const jsonPart = {
        name: 'bleep',
        content: JSON.stringify({ bloop: 'blarp' }),
        headers: { [HttpHeader.contentType]: MimeType.applicationJson },
      }
      body = makeBody(
        { name: 'foo', content: 'bar' },
        jsonPart,
      )

      const result = await parser.parseBody(body, headers)

      expect(result).to.deep.equal({ foo: 'bar', bleep: { bloop: 'blarp' } })
    })

    it('throws a FormMultipartMissingBoundaryError if the content-type header is missing the "boundary" directive', async () => {
      stub(headers, 'get')
        .withArgs(HttpHeader.contentType)
        .returns({ contentType: MimeType.multipartFormData })
      body = makeBody({ name: 'foo', content: 'bar' })

      await expect(parser.parseBody(body, headers)).to.be.rejectedWith(FormMultipartMissingBoundaryError)
    })

  })

})

import { stub } from '@dandi/core/testing'
import {
  ContentDisposition,
  HttpHeader, HttpHeadersStrict,
  MimeTypes,
} from '@dandi/http'
import { HttpBodyParserBase } from '@dandi/http-pipeline'

import { expect } from 'chai'
import { SinonStub } from 'sinon'

describe('HttpBodyParserBase', () => {

  class TestHttpBodyParser extends HttpBodyParserBase {

    public readonly stub: SinonStub
    public get returnValue(): any {
      return this.stub.lastCall?.returnValue
    }

    constructor(async: boolean = false) {
      super()
      if (async) {
        this.stub = stub(this, 'parseBodyFromString').resolvesArg(0)
      } else {
        this.stub = stub(this, 'parseBodyFromString').returnsArg(0)
      }
    }

    public parseBodyFromString(): string | object | Promise<object> {
      return undefined
    }
  }

  type HttpRequestHeadersGetFn<THeaderName extends HttpHeader> = (headerName: THeaderName) => HttpHeadersStrict[THeaderName]

  let parser: TestHttpBodyParser
  let headers: {
    get: SinonStub<[HttpHeader], ReturnType<HttpRequestHeadersGetFn<any>>>
  }

  beforeEach(() => {
    parser = new TestHttpBodyParser()
    headers = { get: stub() }
  })
  afterEach(() => {
    parser = undefined
    headers = undefined
  })

  describe('parseBody', () => {

    describe('when body is a string', () => {

      it(`returns the result from the implementation's parseBodyFromString method`, async () => {
        const body = 'Foo'

        const result = await parser.parseBody(body, headers)

        expect(result).to.equal(parser.returnValue)
      })

      describe(' when the headers include a named content contentDisposition', () => {

        it('constructs an object containing the parsed value', async () => {
          const body = 'Bar'
          headers.get
            .withArgs(HttpHeader.contentDisposition)
            .returns({ contentDisposition: ContentDisposition.formData, name: 'foo' })

          const result = await parser.parseBody(body, headers)

          expect(result).to.deep.equal({ foo: 'Bar' })
        })

        it('constructs an object containing the promised parsed value', async () => {
          parser = new TestHttpBodyParser(true)
          const body = 'Bar'

          headers.get
            .withArgs(HttpHeader.contentDisposition)
            .returns({ contentDisposition: ContentDisposition.formData, name: 'foo' })

          const result = await parser.parseBody(body, headers)

          expect(result).to.deep.equal({ foo: 'Bar' })
        })

      })

    })

    describe('when body is a buffer', () => {

      it(`returns the result from the implementation's parseBodyFromString method`, async () => {
        const body = new Buffer('Foo', 'utf-8')

        const result = await parser.parseBody(body, headers)

        expect(result).to.equal(parser.returnValue)
        expect(result).to.equal('Foo')
      })

      it('uses the encoding specified in the content type header', async () => {
        const content = 'Foo𐐷Bar'
        const body = new Buffer(content, 'utf16le')
        headers.get
          .withArgs(HttpHeader.contentType)
          .returns({ contentType: MimeTypes.textPlain, charset: 'utf16le' })

        const result = await parser.parseBody(body, headers)

        expect(result).to.equal(parser.returnValue)
        expect(result).to.equal(content)
      })
    })

  })

})

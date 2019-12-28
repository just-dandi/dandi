import { Url } from '@dandi/common'
import { testHarness } from '@dandi/core/testing'
import {
  HttpRequest,
  HttpRequestHeaders,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpRequestRawBodyProvider,
} from '@dandi/http'
import { MissingParamError, PathParam, QueryParam, RequestBody } from '@dandi/http-model'
import { BodyParserInfo, HttpBodyParser, HttpRequestBodySourceProvider } from '@dandi/http-pipeline'
import { PassThroughBodyParser } from '@dandi/http-pipeline/testing'
import { Required, UrlProperty } from '@dandi/model'
import { ModelBuilderModule } from '@dandi/model-builder'

import { expect } from 'chai'

describe('Request Decorators', () => {
  class TestModel {
    @UrlProperty()
    @Required()
    public url: Url
  }
  class TestController {
    public testBody(@RequestBody(TestModel) body: TestModel): TestModel {
      return body
    }

    public testPathParam(@PathParam(String) id: string): string {
      return id
    }

    public testQueryParam(@QueryParam(String) search?: string): string {
      return search
    }
  }

  const harness = testHarness(ModelBuilderModule,
    {
      provide: HttpRequest,
      useFactory: () => ({
        body: {
          url: 'http://localhost',
        },
      }),
    },
    HttpRequestRawBodyProvider,
    HttpRequestBodySourceProvider,
    {
      provide: HttpBodyParser,
      useClass: PassThroughBodyParser,
    },
    HttpRequestHeaders,
    {
      provide: HttpRequestPathParamMap,
      useFactory: () => ({}),
    },
    {
      provide: HttpRequestQueryParamMap,
      useFactory: () => ({}),
    },
    {
      provide: BodyParserInfo,
      useValue: [],
    },
  )

  beforeEach(function() {
    this.controller = new TestController()
  })

  describe('@RequestBody', function() {

    it('constructs and validates the body', async function() {
      const result: TestModel = await harness.invoke(this.controller, 'testBody')
      expect(result).to.be.instanceof(TestModel)
      expect(result.url).to.be.instanceof(Url)
    })

  })

  describe('@PathParam', function() {

    it('throws an error if a path param is missing', async function() {
      await expect(harness.invoke(this.controller, 'testPathParam')).to.be.rejectedWith(MissingParamError)
    })

    it('passes the path param value if present', async function() {
      const paramMap = await harness.inject(HttpRequestPathParamMap)
      paramMap.id = 'foo'

      expect(await harness.invoke(this.controller, 'testPathParam')).to.equal('foo')
    })
  })

  describe('@QueryParam', function() {

    it('does not throw an error if a query param is optional', async function() {
      expect(await harness.invoke(this.controller, 'testQueryParam')).to.equal(undefined)
    })

    it('passes the query param value if present', async function() {
      const queryMap = await harness.inject(HttpRequestQueryParamMap)
      queryMap.search = 'foo'

      expect(await harness.invoke(this.controller, 'testQueryParam')).to.equal('foo')
    })

  })
})

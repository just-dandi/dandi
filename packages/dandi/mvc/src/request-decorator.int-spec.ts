import { AppError, Url } from '@dandi/common'
import { testHarness, TestInjector } from '@dandi/core/testing'
import {
  createHttpRequestScope,
  DandiHttpRequestHeadersAccessor,
  HttpModule,
  HttpRequest,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpRequestRawBodyProvider,
  HttpRequestScope,
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

  const harness = testHarness(
    ModelBuilderModule,
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
    DandiHttpRequestHeadersAccessor,
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

  let controller: TestController
  let scope: HttpRequestScope
  let requestInjector: TestInjector

  beforeEach(() => {
    controller = new TestController()
    scope = createHttpRequestScope({} as any)
    requestInjector = harness.createChild(scope)
  })
  afterEach(() => {
    controller = undefined
    scope = undefined
    requestInjector = undefined
  })

  describe('@RequestBody', () => {
    beforeEach(() => {
      harness.register(HttpModule)
    })

    it('constructs and validates the body', async () => {
      const result: TestModel = await requestInjector.invoke(controller, 'testBody')
      expect(result).to.be.instanceof(TestModel)
      expect(result.url).to.be.instanceof(Url)
    })
  })

  describe('@PathParam', () => {
    it('throws an error if a path param is missing', async () => {
      const err = await expect(requestInjector.invoke(controller, 'testPathParam')).to.be.rejected
      expect(AppError.getInnerError(MissingParamError, err)).to.exist
    })

    it('passes the path param value if present', async () => {
      const paramMap = await requestInjector.inject(HttpRequestPathParamMap)
      paramMap.id = 'foo'

      expect(await requestInjector.invoke(controller, 'testPathParam')).to.equal('foo')
    })
  })

  describe('@QueryParam', () => {
    it('does not throw an error if a query param is optional', async () => {
      expect(await requestInjector.invoke(controller, 'testQueryParam')).to.equal(undefined)
    })

    it('passes the query param value if present', async () => {
      const queryMap = await requestInjector.inject(HttpRequestQueryParamMap)
      queryMap.search = 'foo'

      expect(await requestInjector.invoke(controller, 'testQueryParam')).to.equal('foo')
    })
  })
})

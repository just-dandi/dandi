import { AppError, Url } from '@dandi/common'
import { spy, stub, testHarness, TestInjector  } from '@dandi/core/testing'
import {
  createHttpRequestScope,
  DandiHttpRequestHeadersAccessor,
  HttpModule,
  HttpRequest,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpRequestScope,
  HttpRequestBody,
} from '@dandi/http'
import {
  HandleModelErrors,
  HttpModelModule,
  MissingParamError,
  PathParam,
  QueryParam,
  RequestModel,
  RequestModelErrors,
  RequestModelErrorsCollector,
} from '@dandi/http-model'
import { Required, UrlProperty } from '@dandi/model'
import { ModelBuilderModule } from '@dandi/model-builder'

import { expect } from 'chai'
import { SinonSpy } from 'sinon'

describe('Request Decorators', () => {
  class TestModel {
    @UrlProperty()
    @Required()
    public url: Url
  }
  class TestController {

    public testModel(@RequestModel(TestModel) model: TestModel): TestModel {
      return model
    }

    public testPathParam(@PathParam(String) id: string): string {
      return id
    }

    public testQueryParam(@QueryParam(String) search?: string): string {
      return search
    }

    @HandleModelErrors()
    public testModelErrors(
      @RequestModelErrors() errors: RequestModelErrors,
      @RequestModel(TestModel) body: TestModel,
    ): any {
      testModelErrors(errors, body)
      return { errors, body }
    }
  }

  const harness = testHarness(
    HttpModule,
    HttpModelModule,
    ModelBuilderModule,
    DandiHttpRequestHeadersAccessor,
    {
      provide: HttpRequest,
      useFactory: () => req,
    },
    {
      provide: HttpRequestBody,
      useFactory: () => req.body,
    },
    {
      provide: HttpRequestPathParamMap,
      useFactory: () => pathMap,
    },
    {
      provide: HttpRequestQueryParamMap,
      useFactory: () => queryMap,
    },
    {
      provide: RequestModelErrorsCollector,
      useFactory: () => errorsCollector,
    },
  )

  let req: HttpRequest
  let pathMap: any
  let queryMap: any
  let controller: TestController
  let scope: HttpRequestScope
  let requestInjector: TestInjector
  let errorsCollector: RequestModelErrorsCollector
  let testModelErrors: SinonSpy

  beforeEach(() => {
    req = {
      body: {
        url: 'http://localhost',
      },
      get: stub() as any,
    } as HttpRequest
    pathMap = {}
    queryMap = {}
    controller = new TestController()
    scope = createHttpRequestScope({} as any, 'test')
    requestInjector = harness.createChild(scope)
    errorsCollector = new RequestModelErrorsCollector()
    testModelErrors = spy()
  })
  afterEach(() => {
    req = undefined
    pathMap = undefined
    queryMap = undefined
    controller = undefined
    scope = undefined
    requestInjector = undefined
    errorsCollector = undefined
    testModelErrors = undefined
  })

  describe('@RequestModel', () => {

    it('constructs and validates the model', async () => {
      const result: TestModel = await requestInjector.invoke(controller, 'testModel')
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

  describe('@RequestModelErrors', () => {

    it('injects undefined if there are no errors', async () => {
      await requestInjector.invoke(controller, 'testModelErrors')

      expect(testModelErrors).to.have.been.calledOnceWith(undefined)
    })

    it('injects errors if there are errors', async () => {
      delete req.body.url
      await requestInjector.invoke(controller, 'testModelErrors')

      expect(testModelErrors).to.have.been.calledOnceWith({ body: { url: { required: true } } })
    })

  })
})

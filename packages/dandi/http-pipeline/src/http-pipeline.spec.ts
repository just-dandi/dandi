import { Uuid } from '@dandi/common'
import { Inject, SymbolToken } from '@dandi/core'
import { stubHarness, stubProvider, underTest } from '@dandi/core/testing'
import {
  HttpMethod,
  HttpRequest,
  HttpRequestAcceptTypesProvider,
  HttpRequestPathParamMap,
  HttpStatusCode,
  MimeTypes,
  parseMimeTypes,
} from '@dandi/http'
import { MissingParamError, PathParam } from '@dandi/http-model'
import {
  DefaultHttpPipelineErrorHandler,
  HttpPipeline,
  HttpPipelineConfig,
  HttpPipelineErrorResultHandler,
  HttpPipelineResultTransformer,
  HttpPipelineTerminator,
  HttpRequestHandler,
  HttpRequestInfo,
  HttpRequestPreparer,
  HttpRequestPreparerResult,
  HttpPipelineRenderer,
  HttpRequestHandlerMethod,
  HttpResponsePipelineTerminator,
  NativeJsonObjectRenderer,
} from '@dandi/http-pipeline'
import { ModelBuilderModule } from '@dandi/model-builder'

import { expect } from 'chai'
import { stub, createStubInstance, SinonStubbedInstance } from 'sinon'

describe('HttpPipeline', function() {

  let pipeline: HttpPipeline
  let terminator: SinonStubbedInstance<HttpPipelineTerminator>

  const harness = stubHarness(HttpPipeline,
    ModelBuilderModule,
    HttpRequestAcceptTypesProvider,
    {
      provide: HttpRequest,
      useFactory: () => ({
        method: HttpMethod.get,
        path: '/',
        params: {},
        query: {},
        get: stub().callsFake((key: string) => {
          if (key === 'Accept') {
            return MimeTypes.applicationJson
          }
        }),
      }),
    },
    {
      provide: HttpRequestInfo,
      useFactory: () => ({
        requestId: new Uuid(),
        performance: {
          mark: stub(),
        },
      }),
      singleton: true,
    },
    {
      provide: HttpRequestPathParamMap,
      useFactory(req: HttpRequest) {
        return req.params
      },
      deps: [HttpRequest],
    },
    {
      provide: HttpPipelineRenderer,
      useFactory: () => createStubInstance(NativeJsonObjectRenderer),
    },
    {
      // singletons are disabled for HttpPipelineTerminator, so we can't use stubProvider(...)
      provide: HttpPipelineTerminator,
      useFactory: () => terminator,
    },
    stubProvider(DefaultHttpPipelineErrorHandler, HttpPipelineErrorResultHandler),
  )

  beforeEach(async function() {
    terminator = createStubInstance(HttpResponsePipelineTerminator)
    terminator.terminateResponse.returnsArg(0)
    const [errorHandler] = await harness.injectMultiStub(HttpPipelineErrorResultHandler)
    this.errorHandler = errorHandler
    this.errorHandler.handleError.returnsArg(0)
    this.req = await harness.inject(HttpRequest)
    this.requestInfo = await harness.inject(HttpRequestInfo)
    this.renderer = await harness.inject(HttpPipelineRenderer)
    this.renderer.render.returns({
      contentType: 'text/plain',
      renderedBody: '',
    })
    this.registerHandler = <THandler>(instance: THandler, method: keyof THandler) => {
      harness.register(
        {
          provide: HttpRequestHandler,
          useValue: instance,
        },
        {
          provide: HttpRequestHandlerMethod,
          useValue: method,
        },
      )
    }
    this.invokePipeline = () => harness.invoke(pipeline, 'handleRequest')
  })
  afterEach(() => {
    pipeline = undefined
    terminator = undefined
  })

  describe('handleRequest', function() {

    describe('no optional plugins', function() {
      beforeEach(async function() {
        pipeline = await harness.inject(HttpPipeline)
      })

      it('invokes the specified handler method', async function() {
        const spy = stub()

        class TestController {
          public async method(): Promise<any> {
            spy()
          }
        }

        this.registerHandler(new TestController(), 'method')

        await this.invokePipeline()

        expect(spy).to.have.been.called
      })

      it('calls renderer.render() with the result of the handler', async function() {
        const spy = stub()

        class TestController {
          public async method(): Promise<any> {
            spy()
            return { foo: 'yeah!' }
          }
        }

        this.registerHandler(new TestController(), 'method')

        await this.invokePipeline()

        expect(spy).to.have.been.called
        expect(this.renderer.render).to.have.been
          .calledOnce
          .calledWith(parseMimeTypes(MimeTypes.applicationJson), { data: { foo: 'yeah!' } })
      })

      it('sets the contentType using the renderer result', async function() {
        const result = { data: { foo: 'yeah!' }, headers: { 'x-fizzle-bizzle': 'okay' } }

        class TestController {
          public async method(): Promise<any> {
            return result
          }
        }

        this.registerHandler(new TestController(), 'method')
        this.renderer.render.returns({
          contentType: MimeTypes.applicationJson,
        })

        await this.invokePipeline()

        expect(terminator.terminateResponse).to.have.been.calledWith({
          contentType: MimeTypes.applicationJson,
        })
      })

      it('calls res.send() with the rendered output of the renderer result', async function() {

        const result = { data: { foo: 'yeah!' }, headers: { 'x-fizzle-bizzle': 'okay' } }

        class TestController {
          public async method(): Promise<any> {
            return result
          }
        }

        this.registerHandler(new TestController(), 'method')
        this.renderer.render.returns({
          contentType: MimeTypes.applicationJson,
          renderedBody: 'foo yeah!',
        })

        await this.invokePipeline()

        expect(terminator.terminateResponse).to.have.been.calledWith({
          renderedBody: 'foo yeah!',
          contentType: MimeTypes.applicationJson,
        })
      })

      it('returns an error result one of the path params is missing', async function() {

        class TestController {
          public method(@PathParam(String) someParam): any {
            return { message: 'OK', param: someParam }
          }
        }

        this.registerHandler(new TestController(), 'method')

        await this.invokePipeline()

        expect(this.errorHandler.handleError).to.have.been.called
        expect(this.errorHandler.handleError.firstCall.lastArg.errors[0]).to.be.instanceOf(MissingParamError)
      })

      it('returns a text/plain render result if the renderer throws an error', async function() {

        class TestController {
          public method(): any {
            return { message: 'OK' }
          }
        }

        this.registerHandler(new TestController(), 'method')
        this.renderer.render.rejects(new Error('Your llama is lloose!'))

        const result = await this.invokePipeline()

        expect(result).to.deep.equal({
          statusCode: HttpStatusCode.internalServerError,
          contentType: MimeTypes.textPlain,
          headers: undefined,
          renderedBody: 'Your llama is lloose!',
        })

      })

    })

    describe('preparers', function() {

      const testPreparerProvides = SymbolToken.for('http-pipeline-test-preparer')
      const dependentTestPreparerProvides = SymbolToken.for('http-pipeline-dependent-test-preparer')

      @HttpRequestPreparer()
      class TestPreparer implements HttpRequestPreparer {
        public async prepare(): Promise<HttpRequestPreparerResult> {
          return [{
            provide: testPreparerProvides,
            useValue: 'foo',
          }]
        }
      }

      @HttpRequestPreparer(TestPreparer)
      class DependentTestPreparer implements HttpRequestPreparer {
        public async prepare(): Promise<HttpRequestPreparerResult> {
          return [{
            provide: dependentTestPreparerProvides,
            useValue: 'bar',
          }]
        }

      }

      class TestController {
        public method(
          @Inject(testPreparerProvides) testPreparerValue: string,
          @Inject(dependentTestPreparerProvides) dependentTestPreparerValue: string,
        ): any {
          return { message: 'OK', testPreparerValue, dependentTestPreparerValue }
        }
      }

      beforeEach(async function() {
        harness.register(TestPreparer)
        this.registerHandler(new TestController(), 'method')
        this.config = {
          before: [TestPreparer, DependentTestPreparer],
        }
        harness.register(
          {
            provide: HttpPipelineConfig,
            useFactory: () => this.config,
          },
          underTest(TestPreparer),
          underTest(DependentTestPreparer),
        )
        this.preparer = await harness.inject(TestPreparer)
        this.dependentPreparer = await harness.inject(DependentTestPreparer)

        pipeline = await harness.inject(HttpPipeline)
      })

      it('uses providers from preparers to invoke the handler function', async function() {
        await this.invokePipeline()

        expect(this.renderer.render.firstCall.lastArg).to.deep.equal({
          data: {
            message: 'OK',
            testPreparerValue: 'foo',
            dependentTestPreparerValue: 'bar',
          },
        })
      })

    })

    describe('transformers', function() {

      class TestController {
        public method(): any {
          return { message: 'OK' }
        }
      }

      beforeEach(async function() {
        this.registerHandler(new TestController(), 'method')
        this.passThroughTransformer = { transform: stub().resolvesArg(0) }
        this.throwingTransformer = { transform: stub().rejects(new Error('Your llama is lloose!')) }
        this.identifyingTransformer = {
          transform: stub().callsFake(async (result) => {
            result.data.testId = Math.random()
            return result
          }),
        }
        this.anotherThrowingTransformer = { transform: stub().rejects(new Error('Your other llama is allso lloose!'))}
        harness.register(
          { provide: HttpPipelineResultTransformer, useFactory: () => this.passThroughTransformer },
          { provide: HttpPipelineResultTransformer, useFactory: () => this.throwingTransformer },
          { provide: HttpPipelineResultTransformer, useFactory: () => this.identifyingTransformer },
          { provide: HttpPipelineResultTransformer, useFactory: () => this.anotherThrowingTransformer },
        )
        pipeline = await harness.inject(HttpPipeline)
      })

      it('invokes all transformers', async function() {
        await this.invokePipeline()

        expect(this.passThroughTransformer.transform).to.have.been.called
        expect(this.throwingTransformer.transform).to.have.been.called
        expect(this.identifyingTransformer.transform).to.have.been.called
        expect(this.anotherThrowingTransformer.transform).to.have.been.called
      })

      it('adds all errors to the `errors` array on the result', async function() {
        await this.invokePipeline()
        const result = this.renderer.render.firstCall.lastArg

        expect(result.errors).to.have.lengthOf(2)
      })

      it('passes the result of the each successful transformer on to the next', async function() {
        await this.invokePipeline()

        expect(this.throwingTransformer.transform).to.have.been
          .calledWith(await this.passThroughTransformer.transform.firstCall.returnValue)
        expect(this.anotherThrowingTransformer.transform).to.have.been
          .calledWith(await this.identifyingTransformer.transform.firstCall.returnValue)
      })

    })

  })
})

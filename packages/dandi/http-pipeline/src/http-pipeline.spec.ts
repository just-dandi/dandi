import { Uuid } from '@dandi/common'
import { stubHarness } from '@dandi/core/testing'
import {
  HttpMethod,
  HttpRequest,
  HttpRequestAcceptTypesProvider,
  HttpRequestPathParamMap,
  HttpResponse,
  MimeTypes,
  parseMimeTypes,
} from '@dandi/http'
import { MissingParamError, PathParam } from '@dandi/http-model'
import {
  HttpPipeline,
  HttpRequestHandler,
  HttpRequestInfo,
  HttpResponseRenderer,
  NativeJsonObjectRenderer,
  HttpRequestHandlerMethod,
} from '@dandi/http-pipeline'
import { ModelBuilderModule } from '@dandi/model-builder'

import { expect } from 'chai'
import { stub, createStubInstance } from 'sinon'

describe('HttpPipeline', function() {

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
          switch (key) {
            case 'Accept': return MimeTypes.applicationJson
          }
        }),
      }),
    },
    {
      provide: HttpResponse,
      useFactory: () => ({
        contentType: stub().returnsThis(),
        json: stub().returnsThis(),
        send: stub().returnsThis(),
        setHeader: stub().returnsThis(),
        status: stub().returnsThis(),
        end: stub().returnsThis(),
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
      provide: HttpResponseRenderer,
      useFactory: () => createStubInstance(NativeJsonObjectRenderer),
    },
  )

  beforeEach(async function() {
    this.handler = await harness.inject(HttpPipeline)
    this.req = await harness.inject(HttpRequest)
    this.res = await harness.inject(HttpResponse)
    this.requestInfo = await harness.inject(HttpRequestInfo)
    this.renderer = await harness.inject(HttpResponseRenderer)
    this.renderer.render.returns({
      contentType: 'text/plain',
      renderedOutput: '',
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
    this.invokeHandler = () => harness.invoke(this.handler, 'handleRequest')
  })

  describe('handleRequest', function() {
    it('invokes the specified handler method', async function() {
      const spy = stub()
      class TestController {
        public async method(): Promise<any> {
          spy()
        }
      }
      this.registerHandler(new TestController(), 'method')

      await this.invokeHandler()

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

      await this.invokeHandler()

      expect(spy).to.have.been.called
      expect(this.renderer.render).to.have.been.calledWith(parseMimeTypes(MimeTypes.applicationJson), { data: { foo: 'yeah!' } })
    })

    it('adds any response headers specified by the handler result', async function() {
      const result = { data: { foo: 'yeah!' }, headers: { 'x-fizzle-bizzle': 'okay' } }
      class TestController {
        public async method(): Promise<any> {
          return result
        }
      }
      this.registerHandler(new TestController(), 'method')

      await this.invokeHandler()

      expect(this.res.setHeader).to.have.been.calledWith('x-fizzle-bizzle', 'okay')
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

      await this.invokeHandler()

      expect(this.res.contentType).to.have.been.calledWith(MimeTypes.applicationJson)
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
        renderedOutput: 'foo yeah!',
      })

      await this.invokeHandler()

      expect(this.res.send).to.have.been.calledWith('foo yeah!')
    })

    it('throws an error if one of the path params is missing', async function() {

      class TestController {
        public method(@PathParam(String) someParam): any {
          return { message: 'OK', param: someParam }
        }
      }
      this.registerHandler(new TestController(), 'method')

      await expect(this.invokeHandler())
        .to.be.rejectedWith(MissingParamError)

    })
  })
})

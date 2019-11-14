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
import { ModelBuilderModule } from '@dandi/model-builder'
import {
  DefaultRouteHandler,
  MvcResponseRenderer,
  NativeJsonObjectRenderer,
  RequestController,
  RequestInfo,
  Route,
} from '@dandi/mvc'

import { expect } from 'chai'
import { stub, createStubInstance } from 'sinon'

describe('DefaultRouteHandler', function() {

  const harness = stubHarness(DefaultRouteHandler,
    HttpRequestAcceptTypesProvider,
    ModelBuilderModule,
    {
      provide: Route,
      useFactory: () => ({
        controllerCtr: class TestClass {},
        controllerMethod: 'method',
        httpMethod: HttpMethod.get,
        siblingMethods: new Set([HttpMethod.get]),
        path: '/',
      }),
      singleton: true,
    },
    {
      provide: HttpRequest,
      useFactory: () => ({
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
      provide: RequestInfo,
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
      provide: MvcResponseRenderer,
      useFactory: () => createStubInstance(NativeJsonObjectRenderer),
    },
  )

  beforeEach(async function() {
    this.handler = await harness.inject(DefaultRouteHandler)
    this.route = await harness.inject(Route)
    this.req = await harness.inject(HttpRequest)
    this.res = await harness.inject(HttpResponse)
    this.requestInfo = await harness.inject(RequestInfo)
    this.renderer = await harness.inject(MvcResponseRenderer)
    this.renderer.render.returns({
      contentType: 'text/plain',
      renderedOutput: '',
    })
    this.registerController = (controller: any) => {
      harness.register({
        provide: RequestController,
        useValue: controller,
      })
      this.route.controllerCtr = controller.constructor
    }
    this.invokeHandler = () => harness.invoke(this.handler, 'handleRouteRequest')
  })

  describe('handleRouteRequest', function() {
    it('invokes the specified controller method', async function() {
      const spy = stub()
      class TestController {
        public async method(): Promise<any> {
          spy()
        }
      }
      this.registerController(new TestController())

      await this.invokeHandler()

      expect(spy).to.have.been.called
    })

    it('calls renderer.render() with the result of the controller', async function() {
      const spy = stub()
      class TestController {
        public async method(): Promise<any> {
          spy()
          return { foo: 'yeah!' }
        }
      }
      this.registerController(new TestController())

      await this.invokeHandler()

      expect(spy).to.have.been.called
      expect(this.renderer.render).to.have.been.calledWith(parseMimeTypes(MimeTypes.applicationJson), { data: { foo: 'yeah!' } })
    })

    it('adds any response headers specified by the controller result', async function() {
      const result = { data: { foo: 'yeah!' }, headers: { 'x-fizzle-bizzle': 'okay' } }
      class TestController {
        public async method(): Promise<any> {
          return result
        }
      }
      this.registerController(new TestController())

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
      this.registerController(new TestController())
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
      this.registerController(new TestController())
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
      this.registerController(new TestController())

      await expect(this.invokeHandler())
        .to.be.rejectedWith(MissingParamError)

    })
  })
})

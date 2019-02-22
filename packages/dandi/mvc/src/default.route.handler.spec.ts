import { Uuid } from '@dandi/common'
import { Container, NoopLogger, ResolverContext } from '@dandi/core'
import { ModelBuilderModule } from '@dandi/model-builder'
import {
  HttpMethod,
  JsonControllerResult,
  MissingPathParamError,
  PathParam,
  RequestInfo,
  RequestPathParamMap,
  Route,
} from '@dandi/mvc'
import { expect } from 'chai'
import { stub } from 'sinon'

import { DefaultRouteHandler } from './default.route.handler'

describe('DefaultRouteHandler', () => {
  let container: Container
  let handler: DefaultRouteHandler

  let resolverContext: ResolverContext<any>
  let controller: any
  let route: Route
  let requestInfo: RequestInfo
  let req: any
  let res: any

  beforeEach(async () => {
    route = {
      controllerCtr: class TestClass {},
      controllerMethod: 'method',
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
    }
    req = {
      params: {},
      query: {},
    }
    res = {
      contentType: stub().returnsThis(),
      json: stub().returnsThis(),
      send: stub().returnsThis(),
      setHeader: stub().returnsThis(),
      status: stub().returnsThis(),
      end: stub().returnsThis(),
    }
    requestInfo = {
      requestId: new Uuid(),
      performance: {
        mark: stub(),
      },
    }
    container = new Container({
      providers: [
        {
          provide: RequestPathParamMap,
          useFactory() {
            return req.params
          },
        },
        ModelBuilderModule,
      ],
    })
    resolverContext = new ResolverContext(null, [], null, 'test')
    handler = new DefaultRouteHandler(container, new NoopLogger())
    await container.start()
  })
  afterEach(() => {
    handler = undefined
    container = undefined
    resolverContext = undefined
    req = undefined
    res = undefined
    requestInfo = undefined
  })

  describe('handleRouteRequest', () => {
    it('invokes the specified controller method', async () => {
      const spy = stub()
      class TestController {
        public async method(): Promise<any> {
          spy()
        }
      }
      controller = new TestController()
      route.controllerCtr = TestController
      await handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo)

      expect(spy).to.have.been.called
    })

    it('calls res.send() with the result of the controller', async () => {
      const spy = stub()
      class TestController {
        public async method(): Promise<any> {
          spy()
          return { foo: 'yeah!' }
        }
      }
      controller = new TestController()
      await handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo)

      expect(spy).to.have.been.called
      expect(res.send).to.have.been.calledWith(JSON.stringify({ foo: 'yeah!' }))
      expect(res.contentType).to.have.been.calledWith('application/json')
    })

    it('adds any response headers specified by the controller result', async () => {
      const result = new JsonControllerResult({ foo: 'yeah!' }, { 'x-fizzle-bizzle': 'okay' })
      class TestController {
        public async method(): Promise<any> {
          return result
        }
      }
      controller = new TestController()
      await handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo)

      expect(res.setHeader).to.have.been.calledWith('x-fizzle-bizzle', 'okay')
    })

    it('throws an error if one of the path params is missing', async function() {

      class TestController {
        public method(@PathParam(String) someParam) {
          return { message: 'OK' }
        }
      }
      controller = new TestController()

      expect(handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo))
        .to.be.rejectedWith(MissingPathParamError)

    })
  })
})

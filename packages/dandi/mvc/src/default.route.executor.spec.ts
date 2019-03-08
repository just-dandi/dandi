import { AppError, Uuid } from '@dandi/common'
import { Repository, Injector, InjectorContext } from '@dandi/core'
import { stubHarness } from '@dandi/core/testing'
import {
  DefaultRouteExecutor,
  HttpMethod, HttpStatusCode,
  MvcRequest,
  MvcResponse,
  RequestInfo,
  Route, RouteHandler,
  RouteInitializer,
} from '@dandi/mvc'

import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon'

describe('DefaultRouteExecutor', function() {

  const harness = stubHarness(DefaultRouteExecutor,
    {
      provide: Route,
      useFactory: () => ({
        // eslint-disable-next-line brace-style
        controllerCtr: class TestClass {
          public method = stub();
        },
        controllerMethod: 'method',
        httpMethod: HttpMethod.get,
        siblingMethods: new Set([HttpMethod.get]),
        path: '/',
      }),
    },
    {
      provide: RouteInitializer,
      useFactory: () => ({
        initRouteRequest: stub(),
      }),
    },
    {
      provide: RouteHandler,
      useFactory: () => ({
        routeHandler: stub(),
      }),
    },
    {
      provide: MvcRequest,
      useFactory: () => ({
        params: {},
        query: {},
      }),
    },
    {
      provide: MvcResponse,
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
    },
  )

  beforeEach(async function() {
    this.injector = await harness.inject(Injector)
    this.routeExec = await harness.inject(DefaultRouteExecutor)
    this.route = await harness.inject(Route)
    this.routeInit = await harness.inject(RouteInitializer)
    this.req = await harness.inject(MvcRequest)
    this.res = await harness.inject(MvcResponse)
    this.routeHandler = await harness.inject(RouteHandler)
  })

  describe('execRoute', function() {

    beforeEach(function() {
      stub(this.injector, 'invoke')
    })

    it('calls initRouteRequest on the provided RouteInitializer', async function() {
      await this.routeExec.execRoute(this.route, this.req, this.res)
      expect(this.routeInit.initRouteRequest).to.have.been.calledWith(this.route, this.req)
    })

    it('uses the providers from initRouteRequest to invoke the routeHandler', async function() {

      const providers = [
        {
          provide: 'Foo',
          useValue: 'foo',
        },
      ]
      this.routeInit.initRouteRequest.resolves(providers)

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.injector.invoke).to.have.been.calledWith(this.routeHandler, 'handleRouteRequest', ...providers)
    })

    it('catches errors and sends a JSON response with the message of the object', async function() {
      class SomeKindOfError extends AppError {
        constructor() {
          super('oh no')
        }
      }
      this.routeInit.initRouteRequest.resolves([])
      this.injector.invoke.callsFake(() => Promise.reject(new SomeKindOfError()))

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.res.json).to.have.been.calledWith({
        error: { message: 'oh no', type: 'SomeKindOfError' },
      })
    })

    it('uses the status code from thrown errors if present', async function() {
      class SomeKindOfError extends AppError {
        public statusCode = HttpStatusCode.teapot

        constructor() {
          super('oh no, not again!')
        }
      }

      this.routeInit.initRouteRequest.resolves([])
      this.injector.invoke.throws(new SomeKindOfError())

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.res.status).to.have.been.calledWith(HttpStatusCode.teapot)
      expect(this.res.json).to.have.been.calledWith({
        error: { message: 'oh no, not again!', type: 'SomeKindOfError' },
      })
    })

    it('defaults to the status code 500 if the error does not specify one', async function() {
      class SomeKindOfError extends AppError {
        constructor() {
          super('oh no')
        }
      }
      this.injector.invoke.throws(new SomeKindOfError())

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.res.status).to.have.been.calledWith(500)
    })

  })
})

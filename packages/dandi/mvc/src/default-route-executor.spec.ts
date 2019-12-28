import { AppError, Uuid } from '@dandi/common'
import { DisposableUtil } from '@dandi/common/testing'
import { Inject, SymbolToken } from '@dandi/core'
import { stubHarness } from '@dandi/core/testing'
import { HttpMethod, HttpRequest, HttpResponse, HttpStatusCode } from '@dandi/http'
import { HttpPipeline, HttpRequestInfo } from '@dandi/http-pipeline'
import { DefaultRouteExecutor, Route, RouteInitializer } from '@dandi/mvc'

import { expect } from 'chai'
import { SinonStubbedInstance, stub } from 'sinon'

describe('DefaultRouteExecutor', () => {

  const fooToken = SymbolToken.for('Foo')

  class FakeHttpPipeline {

    public readonly handleRequestStub = stub()

    public async handleRequest(@Inject(fooToken) foo: string): Promise<any> {
      this.handleRequestStub(foo)
      return foo
    }
  }

  const harness = stubHarness(DefaultRouteExecutor,
    {
      provide: Route,
      useFactory: () => ({
        // eslint-disable-next-line brace-style
        controllerCtr: class TestClass {
          public method = stub()
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
      provide: HttpPipeline,
      useFactory: () => httpPipeline,
    },
    {
      provide: HttpRequest,
      useFactory: () => ({
        params: {},
        query: {},
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
    },
  )

  let routeExec: DefaultRouteExecutor
  let route: Route
  let routeInit: SinonStubbedInstance<RouteInitializer>
  let req: HttpRequest
  let res: HttpResponse
  let httpPipeline: FakeHttpPipeline

  // because execRoute uses invoke to call routeInit, routeInit gets disposed before we can check the spies
  DisposableUtil.disableRemap()

  beforeEach(async () => {
    httpPipeline = new FakeHttpPipeline()
    routeExec = await harness.inject(DefaultRouteExecutor)
    route = await harness.injectStub(Route)
    routeInit = await harness.injectStub(RouteInitializer)
    req = await harness.injectStub(HttpRequest)
    res = await harness.injectStub(HttpResponse)
  })
  afterEach(() => {
    routeExec = undefined
    route = undefined
    routeInit = undefined
    req = undefined
    res = undefined
    httpPipeline = undefined
  })

  describe('execRoute', () => {

    it('calls initRouteRequest on the provided RouteInitializer', async () => {
      // FIXME: using calledWith here doesn't work because things still somehow get remapDispose'd and chai can't
      //        stringify objects that have been remapDispose'd, so it fails with "already disposed" errors
      await routeExec.execRoute(route, req, res)
      expect(routeInit.initRouteRequest).to.have.been.called
    })

    it('uses the providers from initRouteRequest to invoke the HttpPipeline', async () => {

      const providers = [
        {
          provide: fooToken,
          useValue: 'foo',
        },
      ]
      routeInit.initRouteRequest.resolves(providers)

      // sanity check - fooToken should not be available for general injection
      expect(await harness.inject(fooToken, true)).not.to.exist

      await routeExec.execRoute(route, req, res)

      expect(httpPipeline.handleRequestStub).to.have.been.calledWith('foo')
    })

    it('catches errors and sends a JSON response with the message of the object', async () => {
      class SomeKindOfError extends AppError {
        constructor() {
          super('oh no')
        }
      }
      routeInit.initRouteRequest.callsFake(() => Promise.reject(new SomeKindOfError()))

      await routeExec.execRoute(route, req, res)

      expect(res.json).to.have.been.calledWith({
        error: { message: 'oh no', type: 'SomeKindOfError' },
      })
    })

    it('uses the status code from thrown errors if present', async () => {
      class SomeKindOfError extends AppError {
        public statusCode = HttpStatusCode.teapot

        constructor() {
          super('oh no, not again!')
        }
      }

      routeInit.initRouteRequest.throws(new SomeKindOfError())

      await routeExec.execRoute(route, req, res)

      expect(res.status).to.have.been.calledWith(HttpStatusCode.teapot)
      expect(res.json).to.have.been.calledWith({
        error: { message: 'oh no, not again!', type: 'SomeKindOfError' },
      })
    })

    it('defaults to the status code 500 if the error does not specify one', async () => {
      class SomeKindOfError extends AppError {
        constructor() {
          super('oh no')
        }
      }
      routeInit.initRouteRequest.throws(new SomeKindOfError())

      await routeExec.execRoute(route, req, res)

      expect(res.status).to.have.been.calledWith(500)
    })

  })
})

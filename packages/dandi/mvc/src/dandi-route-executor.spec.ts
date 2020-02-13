import { AppError, Uuid } from '@dandi/common'
import { DisposableUtil } from '@dandi/common/testing'
import { Inject, Provider, SymbolToken } from '@dandi/core'
import { stubHarness, stub } from '@dandi/core/testing'
import { HttpMethod, HttpRequest, HttpResponse, HttpStatusCode } from '@dandi/http'
import { HttpPipeline, HttpRequestInfo } from '@dandi/http-pipeline'
import { AuthorizationCondition, DandiRouteExecutor, Route, RouteInitializer } from '@dandi/mvc'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

describe('DandiRouteExecutor', () => {

  const fooToken = SymbolToken.for('Foo')

  class FakeHttpPipeline {

    public readonly handleRequestStub = stub()

    public async handleRequest(@Inject(fooToken) foo: string): Promise<any> {
      this.handleRequestStub(foo)
      return foo
    }
  }

  const harness = stubHarness(DandiRouteExecutor,
    {
      provide: Route,
      useFactory: () => route,
    },
    {
      provide: RouteInitializer,
      useFactory: () => routeInit,
    },
    {
      provide: HttpPipeline,
      useFactory: () => httpPipeline,
    },
    {
      provide: HttpRequest,
      useFactory: () => req,
    },
    {
      provide: HttpResponse,
      useFactory: () => res,
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

  let providers: Provider<any>[]
  let routeExec: DandiRouteExecutor
  let routeInit: SinonStubbedInstance<RouteInitializer>
  let route: Route
  let req: HttpRequest
  let res: SinonStubbedInstance<HttpResponse>
  let httpPipeline: FakeHttpPipeline

  // because execRoute uses invoke to call routeInit, routeInit gets disposed before we can check the spies
  DisposableUtil.disableRemap()

  beforeEach(async () => {
    httpPipeline = new FakeHttpPipeline()
    providers = [
      {
        provide: fooToken,
        useValue: 'foo',
      },
    ]
    routeInit = {
      initRouteRequest: stub<[Route, HttpRequest, HttpRequestInfo, HttpResponse], Provider<any>[]>()
        .callsFake(() => providers),
    }
    route = {
      // eslint-disable-next-line brace-style
      controllerCtr: class TestClass {
        public method = stub()
      },
      controllerMethod: 'method',
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      siblingRoutes: new Map<HttpMethod, Route>(),
      path: '/',
    }
    req = {
      params: {},
      query: {},
    } as any
    res = {
      send: stub().returnsThis(),
      header: stub().returnsThis(),
      status: stub().returnsThis(),
      end: stub().returnsThis(),
    } as any
    routeExec = await harness.inject(DandiRouteExecutor)
  })
  afterEach(() => {
    providers = undefined
    routeExec = undefined
    routeInit = undefined
    route = undefined
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
      routeInit.initRouteRequest.throws(new SomeKindOfError())

      await routeExec.execRoute(route, req, res)

      expect(res.send).to.have.been.calledOnceWithExactly(JSON.stringify({
        error: {
          type: 'SomeKindOfError',
          message: 'oh no',
        },
      }))
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
      expect(res.send).to.have.been.calledOnceWithExactly(JSON.stringify({
        error: {
          type: 'SomeKindOfError',
          message: 'oh no, not again!',
        },
      }))
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

    it('invokes the pipeline if authorization conditions pass', async () => {
      providers.push({ provide: AuthorizationCondition, useValue: { allowed: true } })

      await routeExec.execRoute(route, req, res)

      expect(res.status).not.to.have.been.called
      expect(httpPipeline.handleRequestStub).to.have.been.called
    })

    it('does not invoke the pipeline, and sends a 403 response if authorization conditions do not pass', async () => {
      providers.push({ provide: AuthorizationCondition, useValue: { allowed: false, reason: 'test' } })

      await routeExec.execRoute(route, req, res)

      expect(httpPipeline.handleRequestStub).not.to.have.been.called
      expect(res.status).to.have.been.calledWith(HttpStatusCode.forbidden)
    })

  })
})

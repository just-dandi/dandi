import { stubHarness } from '@dandi/core/testing'
import { HttpMethod, MvcRequest, MvcResponse, Route, RouteExecutor } from '@dandi/mvc'
import { ExpressInstance, ExpressMvcRouteMapper } from '@dandi-contrib/mvc-express'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('ExpressMvcRouteMapper', function() {

  const harness = stubHarness(ExpressMvcRouteMapper,
    {
      provide: RouteExecutor,
      useFactory: () => ({ execRoute: stub() }),
    },
    {
      provide: ExpressInstance,
      useFactory: () => ({
        use: stub(),
        get: stub(),
        post: stub(),
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
      }),
    },
  )

  beforeEach(async function() {
    this.app = await harness.injectStub(ExpressInstance)
    this.mapper = await harness.inject(ExpressMvcRouteMapper)
    this.routeExec = await harness.injectStub(RouteExecutor)
  })

  it('calls the corresponding express app method to register the route handler', function() {
    class TestController {}

    const route: Route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    }

    this.mapper.mapRoute(route)

    expect(this.app.get).to.have.been.calledWith(route.path)
  })

  it('binds the route executor with the route', function() {
    class TestController {}

    const route: Route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    }

    this.mapper.mapRoute(route)

    const routeFn = this.app.get.firstCall.args[1]
    routeFn()

    expect(this.routeExec.execRoute).to.have.been.calledWith(route)
  })
})

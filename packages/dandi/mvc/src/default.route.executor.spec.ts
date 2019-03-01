import { AppError, Uuid } from '@dandi/common'
import { Repository, Resolver, ResolverContext } from '@dandi/core'
import { stubHarness } from '@dandi/core-testing'
import {
  DefaultRouteExecutor,
  HttpMethod,
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
    this.routeExec = await harness.inject(DefaultRouteExecutor)
    this.route = await harness.inject(Route)
    this.routeInit = await harness.inject(RouteInitializer)
    this.req = await harness.inject(MvcRequest)
    this.res = await harness.inject(MvcResponse)
    this.resolver = await harness.inject(Resolver)
    this.routeHandler = await harness.inject(RouteHandler)
  })

  describe('execRoute', function() {

    beforeEach(function() {
      stub(this.resolver, 'invoke')
    })

    it('calls initRouteRequest on the provided RouteInitializer', async function() {
      await this.routeExec.execRoute(this.route, this.req, this.res)
      expect(this.routeInit.initRouteRequest).to.have.been.calledWith(this.route, this.req)
    })

    it('uses the repo from initRouteRequest to invoke the routeHandler', async function() {
      const repo = createStubInstance(Repository as any)
      this.routeInit.initRouteRequest.returns(repo)

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.resolver.invoke).to.have.been.calledWith(this.routeHandler, this.routeHandler.handleRouteRequest, repo)
    })

    it('catches errors and sends a JSON response with the message of the object', async function() {
      class SomeKindOfError extends AppError {
        constructor() {
          super('oh no')
        }
      }
      this.resolver.invoke.throws(new SomeKindOfError())

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.res.json).to.have.been.calledWith({
        error: { message: 'oh no', type: 'SomeKindOfError' },
      })
    })

    it('uses the status code from thrown errors if present', async function() {
      class SomeKindOfError extends AppError {
        public statusCode = 418;

        constructor() {
          super('oh no')
        }
      }

      this.resolver.invoke.throws(new SomeKindOfError())

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.res.status).to.have.been.calledWith(418)
      expect(this.res.json).to.have.been.calledWith({
        error: { message: 'oh no', type: 'SomeKindOfError' },
      })
    })

    it('defaults to the status code 500 if the error does not specify one', async function() {
      class SomeKindOfError extends AppError {
        constructor() {
          super('oh no')
        }
      }
      this.resolver.invoke.throws(new SomeKindOfError())

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(this.res.status).to.have.been.calledWith(500)
    })

    it('calls the dispose() method on the repository', async function() {
      const repo: SinonStubbedInstance<Repository> = createStubInstance(Repository as any)
      this.routeInit.initRouteRequest.returns(repo)

      await this.routeExec.execRoute(this.route, this.req, this.res)

      expect(repo.dispose).to.have.been.called
    })
  })
})

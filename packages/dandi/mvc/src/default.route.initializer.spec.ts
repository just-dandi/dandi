import { Uuid } from '@dandi/common'
import { Provider } from '@dandi/core'
import { testHarness } from '@dandi/core/testing'
import {
  ForbiddenError,
  HttpMethod,
  HttpRequestBody,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpRequest,
  HttpResponse,
} from '@dandi/http'
import { RequestBody } from '@dandi/http-model'
import {
  AuthorizationAuthProviderFactory,
  AuthorizationCondition,
  AuthProviderFactory,
  DefaultRouteInitializer,
  RequestController,
  RequestProviderRegistrar,
  Route,
  RouteInitializationError,
} from '@dandi/mvc'
import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'

describe('DefaultRouteInitializer', function() {

  const harness = testHarness(DefaultRouteInitializer,
    {
      provide: AuthProviderFactory,
      useFactory: () => createStubInstance(AuthorizationAuthProviderFactory),
    },
  )

  class TestModel {}

  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public method(@RequestBody(TestModel) body: TestModel): void {}
  }

  beforeEach(async function() {
    this.authProviderFactory = await harness.injectStub(AuthProviderFactory)
    this.authProviderFactory.generateAuthProviders.resolves([])
    this.initializer = await harness.inject(DefaultRouteInitializer)
    this.route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    }
    this.req = {
      get: stub(),
      params: {},
      query: {},
    }
    this.res = {
      contentType: stub().returnsThis(),
      json: stub().returnsThis(),
      send: stub().returnsThis(),
      setHeader: stub().returnsThis(),
      status: stub().returnsThis(),
    }
    this.requestInfo = {
      requestId: new Uuid(),
      performance: {
        mark: stub(),
      },
    }
  })

  describe('initRouteRequest', function() {
    it('does not register a request body provider if there is no body', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(harness.inject(HttpRequestBody, ...providers)).to.be.rejected
    })

    it('generates a provider for the request object', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(await harness.inject(HttpRequest, ...providers)).to.equal(this.req)
    })

    it('generates a provider for the response object', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(await harness.inject(HttpResponse, ...providers)).to.equal(this.res)
    })

    it('generates a provider for the path params object', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(await harness.inject(HttpRequestPathParamMap, ...providers)).to.equal(this.req.params)
    })

    it('generates a provider for the query params object', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(await harness.inject(HttpRequestQueryParamMap, ...providers)).to.equal(this.req.query)
    })

    it('generates a provider for the route object', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(await harness.inject(Route, ...providers)).to.equal(this.route)
    })

    it('generates a provider for the controllerCtr', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(await harness.inject(RequestController, ...providers)).to.be.instanceOf(TestController)
    })

    it('wraps caught errors in RouteInitializationError', async function() {
      const error = new Error('Your llama is lloose!')
      stub(this.initializer, 'generateRequestProviders').throws(error)

      const result = await expect(this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)).to.be.rejectedWith(
        RouteInitializationError,
      )
      expect(result.innerError).to.equal(error)
    })

    it('adds request body providers if the method has a parameter that requests HttpRequestBody', async function() {
      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)
      expect(providers.find(p => p.provide === HttpRequestBody)).to.exist
    })

    it('registers any authProviders', async function() {
      class Foo {}
      const value = {}
      this.authProviderFactory.generateAuthProviders.resolves([{ provide: Foo, useValue: value }])

      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)

      expect(providers.find(p => p.provide === Foo)).to.exist
    })

    it('does not throw if all authorization conditions pass', async function() {
      this.authProviderFactory.generateAuthProviders.resolves([
        { provide: AuthorizationCondition, useValue: { allowed: true } },
      ])

      await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)
    })

    it('throws a Forbidden error if authorization conditions do not pass', async function() {
      this.authProviderFactory.generateAuthProviders.resolves([
        { provide: AuthorizationCondition, useValue: { allowed: false, reason: 'test' } },
      ])

      const error = await expect(this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)).to.be.rejectedWith(
        RouteInitializationError,
      )

      expect(error.innerError).to.be.instanceOf(ForbiddenError)
      expect(error.innerError.message).to.equal('Forbidden')
      expect(error.innerError.internalMessage).to.equal('test')
    })

    it('adds providers from any defined registrars', async function() {
      class Foo {}
      this.initializer.registrars = [
        {
          async provide(): Promise<Array<Provider<any>>> {
            return [
              {
                provide: Foo,
                useValue: {},
              },
            ]
          },
        },
      ] as RequestProviderRegistrar[]

      const providers = await this.initializer.initRouteRequest(this.route, this.req, this.requestInfo, this.res)
      expect(providers.find(p => p.provide === Foo)).to.exist
    })
  })
})

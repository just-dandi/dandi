import { Uuid } from '@dandi/common'
import { Injector, Registerable } from '@dandi/core'
import { stubValueProvider, testHarness, TestInjector, TestInjectorBase } from '@dandi/core/testing'
import {
  createHttpRequestScope,
  HttpMethod,
  HttpRequest,
  HttpRequestBody,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpResponse,
} from '@dandi/http'
import { RequestBody } from '@dandi/http-model'
import { HttpRequestInfo } from '@dandi/http-pipeline'
import { httpResponseFixture } from '@dandi/http/testing'
import {
  AuthorizationAuthProviderFactory,
  AuthProviderFactory,
  DefaultRouteInitializer,
  RequestController,
  Route,
  RouteInitializationError,
} from '@dandi/mvc'

import { expect } from 'chai'
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon'

describe('DefaultRouteInitializer', () => {

  const harness = testHarness(DefaultRouteInitializer,
    {
      provide: AuthProviderFactory,
      useFactory: () => createStubInstance(AuthorizationAuthProviderFactory),
    },
    stubValueProvider(Route, () => route),
    stubValueProvider(HttpRequest, () => req),
    stubValueProvider(HttpResponse, () => res),
    stubValueProvider(HttpRequestInfo, () => requestInfo),
  )

  class TestModel {}

  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public method(@RequestBody(TestModel) body: TestModel): void {}
  }

  function createRequestInjector(providers: Registerable[]): TestInjector {
    return new TestInjectorBase(injector.createChild(createHttpRequestScope(req), providers))
  }

  let injector: Injector
  let authProviderFactory: SinonStubbedInstance<AuthProviderFactory>
  let initializer: DefaultRouteInitializer
  let route: Route
  let req: HttpRequest
  let res: HttpResponse
  let requestInfo: HttpRequestInfo

  beforeEach(async () => {
    injector = await harness.inject(Injector)
    authProviderFactory = await harness.injectStub(AuthProviderFactory)
    authProviderFactory.generateAuthProviders.returns([])
    initializer = await harness.inject(DefaultRouteInitializer)
    route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    }
    req = {
      method: HttpMethod.get,
      get: stub(),
      params: {},
      query: {},
      body: undefined,
      path: '/test',
    }
    res = httpResponseFixture()
    requestInfo = {
      requestId: new Uuid(),
      performance: {
        mark: stub(),
      },
    }
  })
  afterEach(() => {
    injector = undefined
    authProviderFactory = undefined
    initializer = undefined
    route = undefined
    req = undefined
    res = undefined
    requestInfo = undefined
  })

  describe('initRouteRequest', () => {
    it('does not register a request body provider if there is no body', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      await expect(routeInjector.inject(HttpRequestBody)).to.be.rejected
    })

    it('generates a provider for the request object', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      expect(await routeInjector.inject(HttpRequest)).to.equal(req)
    })

    it('generates a provider for the response object', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      expect(await routeInjector.inject(HttpResponse)).to.equal(res)
    })

    it('generates a provider for the path params object', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      expect(await routeInjector.inject(HttpRequestPathParamMap)).to.equal(req.params)
    })

    it('generates a provider for the query params object', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      expect(await routeInjector.inject(HttpRequestQueryParamMap)).to.equal(req.query)
    })

    it('generates a provider for the route object', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      expect(await routeInjector.inject(Route)).to.equal(route)
    })

    it('generates a provider for the controllerCtr', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const routeInjector = createRequestInjector(providers)

      expect(await routeInjector.inject(RequestController)).to.be.instanceOf(TestController)
    })

    it('wraps caught errors in RouteInitializationError', async () => {
      const error = new Error('Your llama is lloose!')
      stub(initializer as any, 'generateRequestProviders').throws(error)

      expect(() => initializer.initRouteRequest(route, req, requestInfo, res))
        .to.throw(RouteInitializationError)
        .includes({
          innerError: error,
        })
    })

    it('adds request body providers if the method has a parameter that requests HttpRequestBody', async () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      expect(providers.find(p => p.provide === HttpRequestBody)).to.exist
    })

    it('registers any authProviders', async () => {
      class Foo {}
      const value = {}
      authProviderFactory.generateAuthProviders.returns([{ provide: Foo, useValue: value }])

      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      expect(providers.find(p => p.provide === Foo)).to.exist
    })

  })
})

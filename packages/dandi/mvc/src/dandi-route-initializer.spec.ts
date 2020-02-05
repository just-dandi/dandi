import { Uuid } from '@dandi/common'
import { Injector, Registerable } from '@dandi/core'
import { stubValueProvider, testHarness, TestInjector, TestInjectorBase } from '@dandi/core/testing'
import {
  createHttpRequestScope,
  HttpHeader,
  HttpMethod,
  HttpModule,
  HttpRequest,
  HttpRequestBody,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpResponse,
} from '@dandi/http'
import { RequestBody } from '@dandi/http-model'
import {
  CorsAllowCredentials,
  CorsAllowHeaders,
  CorsAllowMethods,
  CorsAllowOrigin,
  CorsExposeHeaders,
  CorsHeaderValues,
  CorsMaxAge,
  CorsOriginWhitelist,
  HttpRequestInfo,
} from '@dandi/http-pipeline'
import { httpResponseFixture } from '@dandi/http/testing'
import {
  AuthorizationAuthProviderFactory,
  AuthProviderFactory,
  Controller,
  DandiRouteInitializer,
  RequestController,
  Route,
  RouteInitializationError,
} from '@dandi/mvc'

import { expect } from 'chai'
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon'

describe('DandiRouteInitializer', () => {

  const harness = testHarness(DandiRouteInitializer,
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

  @Controller('/dandi-route-initializer-test')
  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public method(@RequestBody(TestModel) body: TestModel): void {}
  }

  function createRequestInjector(providers: Registerable[]): TestInjector {
    return new TestInjectorBase(injector.createChild(createHttpRequestScope(req), providers))
  }

  let injector: Injector
  let authProviderFactory: SinonStubbedInstance<AuthProviderFactory>
  let initializer: DandiRouteInitializer
  let route: Route
  let req: SinonStubbedInstance<HttpRequest>
  let res: HttpResponse
  let requestInfo: HttpRequestInfo

  beforeEach(async () => {
    injector = await harness.inject(Injector)
    authProviderFactory = await harness.injectStub(AuthProviderFactory)
    authProviderFactory.generateAuthProviders.returns([])
    initializer = await harness.inject(DandiRouteInitializer)
    route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      siblingRoutes: new Map<HttpMethod, Route>(),
      path: '/dandi-route-initializer-test',
      controllerCtr: TestController,
      controllerMethod: 'method',
    }
    route.siblingRoutes.set(HttpMethod.get, route)
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

    it('does not add any cors providers if there is no cors config', () => {
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)
      const corsTokens = [
        CorsAllowCredentials,
        CorsAllowHeaders,
        CorsAllowMethods,
        CorsAllowOrigin,
        CorsExposeHeaders,
        CorsMaxAge,
      ]
      expect(providers.some(p => corsTokens.includes(p.provide))).to.be.false
    })

    it('adds a CorsAllowMethods provider if the route cors property is set to true', () => {
      route.cors = true
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      expect(providers.map(p => p.provide)).to.include(CorsAllowMethods)
    })

    it('adds a CorsAllowMethods provider if the route cors is set to a configuration object', () => {
      route.cors = {}
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      expect(providers.map(p => p.provide)).to.include(CorsAllowMethods)
    })

    it('adds a CorsAllowCredentials provider if the route.cors.allowCredentials property is set to true', () => {
      route.cors = { allowCredentials: true }
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      expect(providers.map(p => p.provide)).to.include(CorsAllowCredentials)
    })

    it('adds a CorsAllowOrigin factory provider if the route.cors.allowOrigin property is a function', () => {
      route.cors = { allowOrigin: () => 'the-origin.com' }
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      const allowOriginProvider = providers.find(p => p.provide === CorsAllowOrigin)

      expect(allowOriginProvider).to.exist
      expect(allowOriginProvider).to.include({ provide: CorsAllowOrigin, useFactory: route.cors.allowOrigin })
    })

    it('adds CorsOriginWhitelist and CorsAllowOrigin providers if the route.cors.allowOrigin property is an array', () => {
      route.cors = { allowOrigin: ['the-origin.com'] }
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      const allowOriginProvider = providers.find(p => p.provide === CorsAllowOrigin)
      const originWhitelistProvider = providers.find(p => p.provide === CorsOriginWhitelist)

      expect(allowOriginProvider).to.exist
      expect(originWhitelistProvider).to.exist
      expect(originWhitelistProvider).to.include({ provide: CorsOriginWhitelist, useValue: route.cors.allowOrigin })
    })

    it('adds a CorsExposeHeaders provider if the route.cors.exposeHeaders property is set', () => {
      route.cors = { exposeHeaders: [HttpHeader.contentType] }
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      const exposeHeadersProvider = providers.find(p => p.provide === CorsExposeHeaders)

      expect(exposeHeadersProvider).to.exist
      expect(exposeHeadersProvider).to.include({ provide: CorsExposeHeaders, useValue: route.cors.exposeHeaders })
    })

    it('adds a CorsMaxAge provider if the route.cors.maxAge property is set', () => {
      route.cors = { maxAge: 0 }
      const providers = initializer.initRouteRequest(route, req, requestInfo, res)

      const maxAgeProvider = providers.find(p => p.provide === CorsMaxAge)

      expect(maxAgeProvider).to.exist
      expect(maxAgeProvider).to.include({ provide: CorsMaxAge, useValue: route.cors.maxAge })
    })

  })

  describe('determineAllowedMethods', () => {

    let routes: Route[]

    beforeEach(() => {
      const siblingRoutes = new Map<HttpMethod, Route>()
      const getRoute: Route = {
        cors: {
          allowOrigin: ['some-origin.com'],
        },
        path : '/string',
        httpMethod: HttpMethod.get,
        controllerCtr: Object,
        controllerMethod: 'toString',
        siblingMethods: new Set<HttpMethod>([HttpMethod.post, HttpMethod.put]),
        siblingRoutes,
      }
      const postRoute: Route = Object.assign({}, getRoute, {
        httpMethod: HttpMethod.post,
        siblingMethods: new Set<HttpMethod>([HttpMethod.get, HttpMethod.put]),
      })
      const putRoute: Route = Object.assign({}, getRoute, {
        cors: {
          allowOrigin: ['not-the-origin-you-are-looking-for.com'],
        },
        httpMethod: HttpMethod.put,
        siblingMethods: new Set<HttpMethod>([HttpMethod.get, HttpMethod.post]),
      })

      routes = [
        getRoute,
        postRoute,
        putRoute,
      ]

      routes.forEach(route => siblingRoutes.set(route.httpMethod, route))
    })
    afterEach(() => {
      routes = undefined
    })

    it('returns the array of HttpMethods that are allowed given the request', async () => {

      harness.register(CorsHeaderValues, HttpModule)
      req.get.withArgs(HttpHeader.origin).returns('some-origin.com')
      req.get.withArgs(HttpHeader.host).returns('another-origin.com')
      const providers = initializer.initRouteRequest(routes[0], req, requestInfo, res)
      const injector = harness.createChild(createHttpRequestScope(req), providers)
      const allowedMethods = await injector.inject(CorsAllowMethods)

      expect(allowedMethods).to.deep.equal([HttpMethod.get, HttpMethod.post])

    })

  })
})

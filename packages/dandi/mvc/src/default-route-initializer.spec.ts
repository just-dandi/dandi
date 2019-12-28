import { Uuid } from '@dandi/common'
import { Injector, Provider } from '@dandi/core'
import { stubValueProvider, testHarness } from '@dandi/core/testing'
import {
  ForbiddenError,
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
  AuthorizationCondition,
  AuthProviderFactory,
  DefaultRouteInitializer,
  RequestController,
  RequestProviderRegistrar,
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
    stubValueProvider(HttpRequestInfo ,() => requestInfo),
  )

  class TestModel {}

  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public method(@RequestBody(TestModel) body: TestModel): void {}
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
    authProviderFactory.generateAuthProviders.resolves([])
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

  describe('initRouteRequest', () => {
    it('does not register a request body provider if there is no body', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(harness.inject(HttpRequestBody, ...providers)).to.be.rejected
    })

    it('generates a provider for the request object', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(await harness.inject(HttpRequest, ...providers)).to.equal(req)
    })

    it('generates a provider for the response object', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(await harness.inject(HttpResponse, ...providers)).to.equal(res)
    })

    it('generates a provider for the path params object', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(await harness.inject(HttpRequestPathParamMap, ...providers)).to.equal(req.params)
    })

    it('generates a provider for the query params object', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(await harness.inject(HttpRequestQueryParamMap, ...providers)).to.equal(req.query)
    })

    it('generates a provider for the route object', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(await harness.inject(Route, ...providers)).to.equal(route)
    })

    it('generates a provider for the controllerCtr', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(await harness.inject(RequestController, ...providers)).to.be.instanceOf(TestController)
    })

    it('wraps caught errors in RouteInitializationError', async () => {
      const error = new Error('Your llama is lloose!')
      stub(initializer as any, 'generateRequestProviders').throws(error)

      const result = await expect(initializer.initRouteRequest(injector, route, req, requestInfo, res)).to.be.rejectedWith(
        RouteInitializationError,
      )
      expect(result.innerError).to.equal(error)
    })

    it('adds request body providers if the method has a parameter that requests HttpRequestBody', async () => {
      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)
      expect(providers.find(p => p.provide === HttpRequestBody)).to.exist
    })

    it('registers any authProviders', async () => {
      class Foo {}
      const value = {}
      authProviderFactory.generateAuthProviders.resolves([{ provide: Foo, useValue: value }])

      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)

      expect(providers.find(p => p.provide === Foo)).to.exist
    })

    it('does not throw if all authorization conditions pass', async () => {
      authProviderFactory.generateAuthProviders.resolves([
        { provide: AuthorizationCondition, useValue: { allowed: true } },
      ])

      await initializer.initRouteRequest(injector, route, req, requestInfo, res)
    })

    it('throws a Forbidden error if authorization conditions do not pass', async () => {
      authProviderFactory.generateAuthProviders.resolves([
        { provide: AuthorizationCondition, useValue: { allowed: false, reason: 'test' } },
      ])

      const error = await expect(initializer.initRouteRequest(injector, route, req, requestInfo, res)).to.be.rejectedWith(
        RouteInitializationError,
      )

      expect(error.innerError).to.be.instanceOf(ForbiddenError)
      expect(error.innerError.message).to.equal('Forbidden')
      expect(error.innerError.internalMessage).to.equal('test')
    })

    it('adds providers from any defined registrars', async () => {
      class Foo {}
      (initializer as any).registrars = [
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

      const providers = await initializer.initRouteRequest(injector, route, req, requestInfo, res)
      expect(providers.find(p => p.provide === Foo)).to.exist
    })
  })
})

import { Uuid } from '@dandi/common'
import { Container, NoopLogger, Provider } from '@dandi/core'
import {
  AuthProviderFactory,
  AuthorizationAuthProviderFactory,
  AuthorizationCondition,
  DefaultRouteInitializer,
  ForbiddenError,
  HttpMethod,
  HttpRequestBody,
  MvcRequest,
  MvcResponse,
  RequestBody,
  RequestController,
  RequestInfo,
  RequestPathParamMap,
  RequestProviderRegistrar,
  RequestQueryParamMap,
  Route,
  RouteInitializationError,
  RouteInitializer,
} from '@dandi/mvc'
import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon'

describe('DefaultRouteInitializer', () => {
  let container: Container
  let initializer: RouteInitializer
  let route: Route
  let req: any
  let requestInfo: RequestInfo
  let res: any
  let authProviderFactory: SinonStubbedInstance<AuthProviderFactory>

  class TestModel {}

  class TestController {
    public method(@RequestBody(TestModel) body: TestModel) {}
  }

  beforeEach(async () => {
    container = new Container()
    await container.start()
    authProviderFactory = createStubInstance(AuthorizationAuthProviderFactory)
    authProviderFactory.createAuthProviders.resolves([])
    initializer = new DefaultRouteInitializer(container, null, new NoopLogger(), authProviderFactory)
    route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    }
    req = {
      get: stub(),
      params: {},
      query: {},
    }
    requestInfo = {
      requestId: new Uuid(),
      performance: {
        mark: stub(),
      },
    }
    res = {
      contentType: stub().returnsThis(),
      json: stub().returnsThis(),
      send: stub().returnsThis(),
      setHeader: stub().returnsThis(),
      status: stub().returnsThis(),
    }
  })
  afterEach(() => {
    initializer = undefined
    container = undefined
    req = undefined
    requestInfo = undefined
    res = undefined
  })

  describe('initRouteRequest', () => {
    it('does not register a request body provider if there is no body', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect(container.resolve(HttpRequestBody, null, repo)).to.be.rejected
    })

    it('adds a provider for the request object', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect((await container.resolve(MvcRequest, null, repo)).value).to.equal(req)
    })

    it('adds a provider for the response object', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect((await container.resolve(MvcResponse, null, repo)).value).to.equal(res)
    })

    it('adds a provider for the path params object', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect((await container.resolve(RequestPathParamMap, null, repo)).value).to.equal(req.params)
    })

    it('adds a provider for the query params object', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect((await container.resolve(RequestQueryParamMap, null, repo)).value).to.equal(req.query)
    })

    it('adds a provider for the route object', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect((await container.resolve(Route, null, repo)).value).to.equal(route)
    })

    it('adds a provider for the controllerCtr', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect((await container.resolve(RequestController, null, repo)).value).to.be.instanceOf(TestController)
    })

    it('wraps caught errors in RouteInitializationError', async () => {
      const error = new Error('Your llama is lloose!')
      stub(initializer as any, 'registerRequestProviders').throws(error)

      const result = await expect(initializer.initRouteRequest(route, req, requestInfo, res)).to.be.rejectedWith(
        RouteInitializationError,
      )
      expect(result.innerError).to.equal(error)
    })

    it('adds request body providers if the method has a parameter that requests HttpRequestBody', async () => {
      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)
      expect(repo.get(HttpRequestBody)).to.exist
    })

    it('registers any authProviders', async () => {
      class Foo {}
      const value = {}
      authProviderFactory.createAuthProviders.resolves([{ provide: Foo, useValue: value }])

      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)

      expect(repo.get(Foo)).to.exist
    })

    it('does not throw if all authorization conditions pass', async () => {
      authProviderFactory.createAuthProviders.resolves([
        { provide: AuthorizationCondition, useValue: { allowed: true } },
      ])

      await initializer.initRouteRequest(route, req, requestInfo, res)
    })

    it('throws a Forbidden error if authorization conditions do not pass', async () => {
      authProviderFactory.createAuthProviders.resolves([
        { provide: AuthorizationCondition, useValue: { allowed: false, reason: 'test' } },
      ])

      const error = await expect(initializer.initRouteRequest(route, req, requestInfo, res)).to.be.rejectedWith(
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

      const repo = await initializer.initRouteRequest(route, req, requestInfo, res)
      expect(repo.get(Foo)).to.exist
    })
  })
})

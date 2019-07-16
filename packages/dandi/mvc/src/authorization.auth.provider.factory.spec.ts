import { DandiInjector, Injector } from '@dandi/core'
import {
  AuthorizationService,
  AuthorizedUser,
  HttpMethod,
  IsAuthorized,
  RequestAuthorizationService,
  Route,
  UnauthorizedError,
} from '@dandi/mvc'
import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon'

import { AuthorizationAuthProviderFactory } from './authorization.auth.provider.factory'

describe('AuthorizationAuthProviderFactory', () => {
  let injector: SinonStubbedInstance<Injector>
  let authProviderFactory: AuthorizationAuthProviderFactory
  let route: Route
  let req: any

  beforeEach(() => {
    injector = createStubInstance(DandiInjector)
    authProviderFactory = new AuthorizationAuthProviderFactory(injector)
    route = {
      path: '/',
      controllerCtr: null,
      controllerMethod: null,
      httpMethod: HttpMethod.get,
      siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
    }
    req = {
      get: stub(),
      params: {},
      query: {},
    }
  })
  afterEach(() => {
    injector = undefined
    authProviderFactory = undefined
    route = undefined
    req = undefined
  })

  describe('createAuthProviders', () => {
    it('throws an UnauthorizedError if there is no Authorization header and the route has authorization conditions', async () => {
      route.authorization = [IsAuthorized]
      await expect(authProviderFactory.generateAuthProviders(route, req)).to.be.rejectedWith(UnauthorizedError)
    })

    it('returns a provider for AuthorizedUser that provides a null value if there are no authorization conditions', async () => {
      const result = await authProviderFactory.generateAuthProviders(route, req)
      expect(result).to.deep.equal([
        {
          provide: AuthorizedUser,
          useValue: null,
        },
      ])
    })

    it('adds a provider for a scheme-specific AuthorizationService', async () => {
      const authService = {}
      req.get.returns('Bearer foo')
      injector.inject.withArgs(AuthorizationService('Bearer'), true).resolves({ singleValue: authService })

      const result = await authProviderFactory.generateAuthProviders(route, req)

      expect(result).to.deep.include({
        provide: RequestAuthorizationService,
        useValue: authService,
      })
    })

    it('adds providers from each of the authorization conditions', async () => {
      route.authorization = [IsAuthorized]
      req.get.returns('Bearer foo')

      const result = await authProviderFactory.generateAuthProviders(route, req)

      expect(result).to.include(IsAuthorized)
    })
  })
})

import { InjectionResult, Injector } from '@dandi/core'
import { DandiInjector } from '@dandi/core/internal'
import { HttpMethod } from '@dandi/http'
import {
  AuthorizationAuthProviderFactory,
  AuthorizationService,
  IsAuthorized,
  RequestAuthorizationService,
  Route,
} from '@dandi/mvc'

import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon'

describe('AuthorizationAuthProviderFactory', () => {
  let injector: SinonStubbedInstance<Injector>
  let authProviderFactory: AuthorizationAuthProviderFactory
  let route: Route
  let req: any

  beforeEach(() => {
    injector = createStubInstance(DandiInjector)
    authProviderFactory = new AuthorizationAuthProviderFactory()
    route = {
      path: '/',
      controllerCtr: null,
      controllerMethod: null,
      httpMethod: HttpMethod.get,
      siblingMethods: new Set<HttpMethod>([HttpMethod.get]),
      siblingRoutes: new Map<HttpMethod, Route>(),
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

  describe('generateAuthProviders', () => {

    it('adds a provider for a scheme-specific AuthorizationService', async () => {
      const authService = {}
      req.get.returns('Bearer foo')
      injector.inject.withArgs(AuthorizationService('Bearer'), true).resolves(new InjectionResult(authService))

      const result = await authProviderFactory.generateAuthProviders(route, req)

      const requestAuthProvider = result.find(provider => provider.provide === RequestAuthorizationService)
      expect(requestAuthProvider).to.exist
    })

    it('adds providers from each of the authorization conditions', async () => {
      route.authorization = [IsAuthorized]
      req.get.returns('Bearer foo')

      const result = await authProviderFactory.generateAuthProviders(route, req)

      expect(result).to.include(IsAuthorized)
    })
  })
})

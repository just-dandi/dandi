import { Uuid } from '@dandi/common'
import { FactoryProvider } from '@dandi/core'
import { testHarnessSingle } from '@dandi/core/testing'
import { ModelBuilderModule } from '@dandi/model-builder'
import {
  AuthorizationAuthProviderFactory,
  AuthorizationCondition,
  AuthorizationService,
  Authorized,
  Controller,
  DecoratorRouteGenerator,
  DefaultRouteInitializer,
  HttpGet,
  PathParam,
  RequestPathParamMap,
  RouteGenerator,
  RouteInitializer,
  getControllerMetadata,
} from '@dandi/mvc'
import { expect } from 'chai'
import { stub } from 'sinon'

import { CollectionResource } from './condition.decorator'
import { requestParamToken } from './request.param.decorator'

describe('ConditionDecorator', function() {

  const collection = {
    provide: CollectionResource,
    useValue: ['foo', 'bar', 'hey'],
  }

  @Controller('/')
  class TestController {
    @Authorized()
    @HttpGet('test')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testMethod(@PathParam(String).within(collection) foo: string): void {}
  }

  it("adds a condition to the method's metadata", () => {
    const controllerMeta = getControllerMetadata(TestController)
    const methodMeta = controllerMeta.routeMap.get('testMethod')

    expect(methodMeta.authorization).to.exist
    const condition: FactoryProvider<AuthorizationCondition> = methodMeta.authorization[0] as any
    expect(condition).to.exist
    expect(condition.provide).to.equal(AuthorizationCondition)
    expect(condition.deps).to.include(requestParamToken(RequestPathParamMap, 'testMethod', 'foo'))
    expect(condition.useFactory).to.exist
    expect(condition.useFactory).to.be.instanceOf(Function)
  })

  it('resolves to an AuthorizationCondition', async function() {
    const req: any = {
      get: stub()
        .withArgs('Authorization')
        .returns('Hey 12345'),
      params: { foo: 'bar' },
      query: {},
    }
    const authService = {
      provide: AuthorizationService('Hey'),
      useValue: {
        getAuthorizedUser: stub().resolves({}),
      },
    }
    const res: any = {}
    const info: any = {
      requestId: Uuid.create(),
      performance: {
        mark: stub(),
      },
    }
    const harness = await testHarnessSingle(
      authService,
      TestController,
      AuthorizationAuthProviderFactory,
      DecoratorRouteGenerator,
      DefaultRouteInitializer,
      ModelBuilderModule,
    )

    const generator = await harness.inject(RouteGenerator)
    const routes = generator.generateRoutes()

    const initializer = await harness.inject(RouteInitializer)

    const providers = await initializer.initRouteRequest(routes[0], req, info, res)

    const conditions = await harness.injectMulti(AuthorizationCondition, false, ...providers)
    expect(conditions).to.exist
    expect(conditions).to.deep.equal([
      { allowed: true }, // first for IsAuthorized, included by default
      { allowed: true }, // second for the within condition
    ])
  })
})

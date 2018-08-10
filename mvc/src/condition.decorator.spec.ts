import { Uuid } from '@dandi/common';
import { Container, FactoryProvider } from '@dandi/core';
import { Validation } from '@dandi/model-validation';
import {
  AuthorizationAuthProviderFactory,
  AuthorizationCondition,
  AuthorizationService,
  Authorized,
  Controller,
  DecoratorRouteGenerator,
  DefaultRouteInitializer,
  getControllerMetadata,
  HttpGet,
  PathParam,
  RequestPathParamMap,
  RouteGenerator,
  RouteInitializer,
} from '@dandi/mvc';

import { expect } from 'chai';
import { stub } from 'sinon';

import { CollectionResource } from './condition.decorator';
import { requestParamToken } from './request.param.decorator';

describe('ConditionDecorator', () => {
  beforeEach(() => {});
  afterEach(() => {});

  const collection = {
    provide: CollectionResource,
    useValue: ['foo', 'bar', 'hey'],
  };

  @Controller('/')
  class TestController {
    @Authorized()
    @HttpGet('test')
    public testMethod(@PathParam(String).within(collection) foo: string) {}
  }

  it("adds a condition to the method's metadata", () => {
    const controllerMeta = getControllerMetadata(TestController);
    const methodMeta = controllerMeta.routeMap.get('testMethod');

    expect(methodMeta.authorization).to.exist;
    const condition: FactoryProvider<AuthorizationCondition> = methodMeta.authorization[0] as any;
    expect(condition).to.exist;
    expect(condition.provide).to.equal(AuthorizationCondition);
    expect(condition.deps).to.include(requestParamToken(RequestPathParamMap, 'testMethod', 'foo'));
    expect(condition.useFactory).to.exist;
    expect(condition.useFactory).to.be.instanceOf(Function);
  });

  it('resolves to an AuthorizationCondition', async () => {
    const req: any = {
      get: stub()
        .withArgs('Authorization')
        .returns('Hey 12345'),
      params: { foo: 'bar' },
      query: {},
    };
    const authService = {
      provide: AuthorizationService('Hey'),
      useValue: {
        getAuthorizedUser: stub().resolves({}),
      },
    };
    const res: any = {};
    const info: any = {
      requestId: Uuid.create(),
      performance: {
        mark: stub(),
      },
    };
    const container = new Container({
      providers: [
        authService,
        TestController,
        AuthorizationAuthProviderFactory,
        DecoratorRouteGenerator,
        DefaultRouteInitializer,
        Validation,
      ],
    });
    await container.start();

    const generator = (await container.resolve(RouteGenerator)).singleValue;
    const routes = generator.generateRoutes();

    const initializer = (await container.resolve(RouteInitializer)).singleValue;

    const repo = await initializer.initRouteRequest(routes[0], req, info, res);

    const conditions = (await container.resolve(AuthorizationCondition, false, repo)).arrayValue;
    expect(conditions).to.exist;
    expect(conditions).to.deep.equal([
      { allowed: true }, // first for IsAuthorized, included by default
      { allowed: true }, // second for the within condition
    ]);
  });
});

import { Container, NoopLogger } from '@dandi/core';
import { HttpMethod, Route, RouteExecutor } from '@dandi/mvc';
import { expect } from 'chai';
import { stub } from 'sinon';

import { ExpressMvcRouteMapper } from '../';

describe('ExpressMvcRouteMapper', () => {
  let container: Container;
  let app: any;
  let routeExec: any;
  let mapper: ExpressMvcRouteMapper;
  let req: any;
  let res: any;

  beforeEach(async () => {
    routeExec = { execRoute: stub() };
    container = new Container({
      providers: [{ provide: RouteExecutor, useValue: routeExec }],
    });
    await container.start();
    app = {
      use: stub(),
      get: stub(),
      post: stub(),
    };
    req = {
      params: {},
      query: {},
    };
    res = {
      contentType: stub().returnsThis(),
      json: stub().returnsThis(),
      send: stub().returnsThis(),
      setHeader: stub().returnsThis(),
      status: stub().returnsThis(),
    };
    mapper = new ExpressMvcRouteMapper(
      container,
      app,
      routeExec,
      new NoopLogger(),
    );
  });
  afterEach(() => {
    container = undefined;
    app = undefined;
    mapper = undefined;
    req = undefined;
    res = undefined;
  });

  it('calls the corresponding express app method to register the route handler', () => {
    class TestController {}

    const route: Route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    };

    mapper.mapRoute(route);

    expect(app.get).to.have.been.calledWith(route.path);
  });

  it('binds the route executor with the route', () => {
    class TestController {}

    const route: Route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    };

    mapper.mapRoute(route);

    const routeFn = app.get.firstCall.args[1];
    routeFn();

    expect(routeExec.execRoute).to.have.been.calledWith(route);
  });
});

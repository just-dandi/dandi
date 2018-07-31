import { Uuid } from '@dandi/common';
import { Container, NoopLogger } from '@dandi/core';
import { expect } from 'chai';
import { stub } from 'sinon';

import {
  DefaultRouteInitializer,
  HttpRequestBody,
  MvcRequest,
  MvcResponse,
  RequestController,
  RequestPathParamMap,
  RequestQueryParamMap,
  Route,
  RouteInitializer,
} from '../';

import { HttpMethod } from './http.method';
import { RequestInfo } from './request.info';

describe('DefaultRouteInitialzer', () => {
  let container: Container;
  let initializer: RouteInitializer;
  let route: Route;
  let req: any;
  let requestInfo: RequestInfo;
  let res: any;

  class TestController {
    public method() {}
  }

  beforeEach(async () => {
    container = new Container();
    await container.start();
    initializer = new DefaultRouteInitializer(
      container,
      null,
      new NoopLogger(),
    );
    route = {
      httpMethod: HttpMethod.get,
      siblingMethods: new Set([HttpMethod.get]),
      path: '/',
      controllerCtr: TestController,
      controllerMethod: 'method',
    };
    req = {
      get: stub(),
      params: {},
      query: {},
    };
    requestInfo = {
      requestId: new Uuid(),
      performance: {
        mark: stub(),
      },
    };
    res = {
      contentType: stub().returnsThis(),
      json: stub().returnsThis(),
      send: stub().returnsThis(),
      setHeader: stub().returnsThis(),
      status: stub().returnsThis(),
    };
  });
  afterEach(() => {
    initializer = undefined;
    container = undefined;
    req = undefined;
    requestInfo = undefined;
    res = undefined;
  });

  describe('initRouteRequest', () => {
    it('does not register a request body provider if there is not body', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect(container.resolve(HttpRequestBody, null, repo)).to.eventually.be
        .rejected;
    });

    it('adds a provider for the request object', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect((await container.resolve(MvcRequest, null, repo)).value).to.equal(
        req,
      );
    });

    it('adds a provider for the response object', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect((await container.resolve(MvcResponse, null, repo)).value).to.equal(
        res,
      );
    });

    it('adds a provider for the path params object', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect(
        (await container.resolve(RequestPathParamMap, null, repo)).value,
      ).to.equal(req.params);
    });

    it('adds a provider for the query params object', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect(
        (await container.resolve(RequestQueryParamMap, null, repo)).value,
      ).to.equal(req.query);
    });

    it('adds a provider for the route object', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect((await container.resolve(Route, null, repo)).value).to.equal(
        route,
      );
    });

    it('adds a provider for the controllerCtr', async () => {
      const repo = await initializer.initRouteRequest(
        route,
        req,
        requestInfo,
        res,
      );

      expect(
        (await container.resolve(RequestController, null, repo)).value,
      ).to.be.instanceOf(TestController);
    });
  });
});

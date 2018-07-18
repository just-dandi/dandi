import { Uuid }                                                 from '@dandi/core';
import { Container, NoopLogger, ResolverContext }               from '@dandi/di-core';
import { HttpMethod, JsonControllerResult, RequestInfo, Route } from '@dandi/mvc';

import { ExpressMvcRouteHandler } from '../';

import { expect } from 'chai';
import { stub } from 'sinon';

describe('ExpressMvcRouteHandler', () => {

    let container: Container;
    let handler: ExpressMvcRouteHandler;

    let resolverContext: ResolverContext<any>;
    let controller: any;
    let route: Route;
    let requestInfo: RequestInfo;
    let req: any;
    let res: any;

    beforeEach(async () => {
        container = new Container();
        await container.start();
        resolverContext = ResolverContext.create(null);
        handler = new ExpressMvcRouteHandler(container, new NoopLogger());
        route = {
            controllerCtr: class TestClass {},
            controllerMethod: 'method',
            httpMethod: HttpMethod.get,
            siblingMethods: new Set([HttpMethod.get]),
            cors: false,
            path: '/',
            authorization: false,
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
            end: stub().returnsThis(),
        };
        requestInfo = {
            requestId: new Uuid(),
            performance: {
                mark: stub(),
            },
        };
    });
    afterEach(() => {
        handler = undefined;
        container = undefined;
        resolverContext = undefined;
        req = undefined;
        res = undefined;
        requestInfo = undefined;
    });

    describe('handleRouteRequest', () => {

        it('invokes the specified controller method', async () => {

            const spy = stub();
            class TestController {
                async method(): Promise<any> {
                    spy();
                }
            }
            controller = new TestController();
            route.controllerCtr = TestController;
            await handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo);

            expect(spy).to.have.been.called;

        });

        it('calls res.send() with the result of the controller', async () => {

            const spy = stub();
            class TestController {
                async method(): Promise<any> {
                    spy();
                    return { foo: 'yeah!' };
                }
            }
            const controller = new TestController();
            await handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo);

            expect(spy).to.have.been.called;
            expect(res.send).to.have.been.calledWith(JSON.stringify({ foo: 'yeah!' }));
            expect(res.contentType).to.have.been.calledWith('application/json');

        });

        it('adds any response headers specified by the controller result', async () => {

            const result = new JsonControllerResult({ foo: 'yeah!' }, { 'x-fizzle-bizzle': 'okay' });
            class TestController {
                async method(): Promise<any> {
                    return result;
                }
            }
            const controller = new TestController();
            await handler.handleRouteRequest(resolverContext, controller, route, req, res, requestInfo);

            expect(res.setHeader).to.have.been.calledWith('x-fizzle-bizzle', 'okay');

        });

    });




});

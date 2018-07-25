import { AppError, Uuid }                           from '@dandi/common';
import { Logger, NoopLogger, Repository, Resolver } from '@dandi/core';
import { HttpMethod, RequestInfo, Route, RouteHandler, RouteInitializer } from '@dandi/mvc';

import { expect } from 'chai';
import { stub, createStubInstance, SinonStubbedInstance } from 'sinon';

import { ExpressMvcRouteExecutor } from './express.mvc.route.executor';

describe('ExpressMvcRouteExecutor', () => {

    let routeExec: ExpressMvcRouteExecutor;
    let resolver: SinonStubbedInstance<Resolver>;
    let routeInit: SinonStubbedInstance<RouteInitializer>;
    let routeHandler: SinonStubbedInstance<RouteHandler>;
    let logger: Logger;

    let route: Route;
    let requestInfo: RequestInfo;
    let req: any;
    let res: any;

    beforeEach(() => {
        route = {
            controllerCtr: class TestClass { method = stub() },
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
        resolver = {
            resolve: stub(),
            invoke: stub(),
            invokeInContext: stub(),
        };
        routeInit = {
            initRouteRequest: stub(),
        };
        routeHandler = {
            handleRouteRequest: stub(),
        };
        requestInfo = {
            requestId: new Uuid(),
            performance: {
                mark: stub(),
            },
        };
        logger = createStubInstance(NoopLogger);
        routeExec = new ExpressMvcRouteExecutor(resolver, routeInit, routeHandler, logger);
    });
    afterEach(() => {
        routeInit = undefined;
        routeHandler = undefined;
        logger = undefined;
        resolver = undefined;
        req = undefined;
        res = undefined;
        requestInfo = undefined;
    });


    describe('execRoute', () => {

        it('calls initRouteRequest on the provided RouteInitializer', async () => {

            await routeExec.execRoute(route, req, res);
            expect(routeInit.initRouteRequest).to.have.been.calledWith(route, req);

        });

        it('uses the repo from initRouteRequest to invoke the routeHandler', async () => {

            const repo = createStubInstance(Repository as any);
            routeInit.initRouteRequest.returns(repo);

            await routeExec.execRoute(route, req, res);

            expect(resolver.invoke).to.have.been.calledWith(routeHandler, routeHandler.handleRouteRequest, repo);

        });

        it('catches errors and sends a JSON response with the message of the object', async () => {

            class SomeKindOfError extends AppError {
                constructor() {
                    super('oh no');
                }
            }
            resolver.invoke.throws(new SomeKindOfError());

            await routeExec.execRoute(route, req, res);

            expect(res.json).to.have.been.calledWith({ error: { message: 'oh no', type: 'SomeKindOfError' } });

        });

        it('uses the status code from thrown errors if present', async () => {

            class SomeKindOfError extends AppError {
                constructor() {
                    super('oh no');
                }

                statusCode = 418;
            }

            resolver.invoke.throws(new SomeKindOfError());

            await routeExec.execRoute(route, req, res);

            expect(res.status).to.have.been.calledWith(418);
            expect(res.json).to.have.been.calledWith({ error: { message: 'oh no', type: 'SomeKindOfError' } });

        });

        it('defaults to the status code 500 if the error does not specify one', async () => {

            class SomeKindOfError extends AppError {
                constructor() {
                    super('oh no');
                }
            }
            resolver.invoke.throws(new SomeKindOfError());

            await routeExec.execRoute(route, req, res);

            expect(res.status).to.have.been.calledWith(500);

        });

        it('calls the dispose() method on the repository', async () => {

            const repo: SinonStubbedInstance<Repository> = createStubInstance(Repository as any);
            routeInit.initRouteRequest.returns(repo);

            await routeExec.execRoute(route, req, res);

            expect(repo.dispose).to.have.been.called;

        });

    });

});

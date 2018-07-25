import { AppError, Disposable, Uuid }                                       from '@dandi/common';
import { Inject, Injectable, Logger, Repository, Resolver }                 from '@dandi/core';
import { MvcRequest, MvcResponse, PerfRecord, Route, RouteExecutor, RouteHandler, RouteInitializer } from '@dandi/mvc';

@Injectable(RouteExecutor)
export class ExpressMvcRouteExecutor implements RouteExecutor {

    constructor(
        @Inject(Resolver) private resolver: Resolver,
        @Inject(RouteInitializer) private routeInitializer: RouteInitializer,
        @Inject(RouteHandler) private routeHandler: RouteHandler,
        @Inject(Logger) private logger: Logger,
    ) {}

    public async execRoute(route: Route, req: MvcRequest, res: MvcResponse): Promise<void> {

        const requestId = Uuid.create();
        const performance = new PerfRecord('ExpressRouteExecutor.execRoute', 'begin');

        this.logger.debug(`begin execRoute ${route.controllerCtr.name}.${route.controllerMethod}:`,
            route.httpMethod.toUpperCase(), route.path);

        try {

            this.logger.debug(`before initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod}:`,
                route.httpMethod.toUpperCase(), route.path);

            performance.mark('ExpressRouteExecutor.execRoute', 'beforeInitRouteRequest');
            const requestRepo = await this.routeInitializer.initRouteRequest(route, req, { requestId, performance }, res);
            performance.mark('ExpressRouteExecutor.execRoute', 'afterInitRouteRequest');

            this.logger.debug(`after initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod}:`,
                route.httpMethod.toUpperCase(), route.path);

            await Disposable.useAsync(requestRepo, async (reqRepo: Repository) => {

                this.logger.debug(`before handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod}:`,
                    route.httpMethod.toUpperCase(), route.path);

                performance.mark('ExpressRouteExecutor.execRoute', 'beforeHandleRouteRequest');
                await this.resolver.invoke(this.routeHandler, this.routeHandler.handleRouteRequest, reqRepo);
                performance.mark('ExpressRouteExecutor.execRoute', 'afterHandleRouteRequest');

                this.logger.debug(`after handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod}:`,
                    route.httpMethod.toUpperCase(), route.path);

            });

        } catch (err) {

            this.logger.warn(`error serving ${route.controllerCtr.name}.${route.controllerMethod}:`,
                route.httpMethod.toUpperCase(), route.path, '\n', AppError.stack(err));

            res
                .status(err.statusCode || 500)
                .json({
                    error: {
                        type: err.constructor.name,
                        message: err.message,
                    },
                });

        } finally {

            this.logger.debug(`end execRoute ${route.controllerCtr.name}.${route.controllerMethod}:`,
                route.httpMethod.toUpperCase(), route.path);

            performance.mark('ExpressRouteExecutor.execRoute', 'end');
            this.logger.debug(performance.toString());
        }
    }

}

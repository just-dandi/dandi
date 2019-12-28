import { AppError, Uuid } from '@dandi/common'
import { Inject, Injectable, Logger, Injector } from '@dandi/core'
import { HttpRequest, HttpResponse, HttpStatusCode } from '@dandi/http'
import { HttpPipeline } from '@dandi/http-pipeline'

import { PerfRecord } from './perf-record'
import { Route } from './route'
import { RouteExecutor } from './route-executor'
import { RouteInitializer } from './route-initializer'

@Injectable(RouteExecutor)
export class DefaultRouteExecutor implements RouteExecutor {
  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(RouteInitializer) private routeInitializer: RouteInitializer,
    @Inject(HttpPipeline) private pipeline: HttpPipeline,
    @Inject(Logger) private logger: Logger,
  ) {}

  public async execRoute(route: Route, req: HttpRequest, res: HttpResponse): Promise<void> {
    return await this.injector.invoke(this as DefaultRouteExecutor, 'execRouteInternal',
      {
        provide: Route,
        useValue: route,
      },
      {
        provide: HttpRequest,
        useValue: req,
      },
      {
        provide: HttpResponse,
        useValue: res,
      },
    )
  }

  public async execRouteInternal(
    @Inject(Injector) injector: Injector,
    @Inject(Route) route: Route,
    @Inject(HttpRequest) req: HttpRequest,
    @Inject(HttpResponse) res: HttpResponse,
  ): Promise<void> {
    const requestId = Uuid.create()
    const performance = new PerfRecord('DefaultRouteExecutor.execRoute', 'begin')

    this.logger.debug(
      `begin execRoute ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )

    try {
      this.logger.debug(
        `before initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )

      performance.mark('DefaultRouteExecutor.execRoute', 'beforeInitRouteRequest')
      const requestProviders = await this.routeInitializer.initRouteRequest(injector, route, req, { requestId, performance }, res)
      performance.mark('DefaultRouteExecutor.execRoute', 'afterInitRouteRequest')

      this.logger.debug(
        `after initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )

      this.logger.debug(
        `before handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )

      performance.mark('DefaultRouteExecutor.execRoute', 'beforeHandleRequest')
      await injector.invoke(this.pipeline, 'handleRequest', ...requestProviders)
      performance.mark('DefaultRouteExecutor.execRoute', 'afterHandleRequest')

      this.logger.debug(
        `after handleRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )
    } catch (err) {
      this.logger.warn(
        `error serving ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
        '\n',
        AppError.stack(err),
      )

      res.status(err.statusCode || HttpStatusCode.internalServerError).json({
        error: {
          type: err.constructor.name,
          message: err.message,
        },
      })
    } finally {
      this.logger.debug(
        `end execRoute ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )

      performance.mark('DefaultRouteExecutor.execRoute', 'end')
      this.logger.debug(performance.toString())
    }
  }
}

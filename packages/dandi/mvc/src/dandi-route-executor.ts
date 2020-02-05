import { AppError, Disposable, Uuid } from '@dandi/common'
import { Inject, Injectable, Logger, Injector, Optional } from '@dandi/core'
import { createHttpRequestScope, ForbiddenError, HttpRequest, HttpResponse, HttpStatusCode } from '@dandi/http'
import { HttpPipeline } from '@dandi/http-pipeline'

import { AuthorizationCondition, DeniedAuthorization } from './authorization.condition'
import { PerfRecord } from './perf-record'
import { Route } from './route'
import { RouteExecutor } from './route-executor'
import { RouteInitializer } from './route-initializer'

@Injectable(RouteExecutor)
export class DandiRouteExecutor implements RouteExecutor {
  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(RouteInitializer) private routeInitializer: RouteInitializer,
    @Inject(HttpPipeline) private pipeline: HttpPipeline,
    @Inject(Logger) private logger: Logger,
  ) {}

  public async execRoute(route: Route, req: HttpRequest, res: HttpResponse): Promise<void> {
    const performance = new PerfRecord('DandiRouteExecutor.execRoute', 'begin')

    this.logger.debug(
      `begin execRoute ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )
    const requestId = Uuid.create()

    try {
      this.logger.debug(
        `before initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )

      performance.mark('DandiRouteExecutor.execRoute', 'beforeInitRouteRequest')
      const requestProviders = this.routeInitializer.initRouteRequest(route, req, { requestId, performance }, res)
      performance.mark('DandiRouteExecutor.execRoute', 'afterInitRouteRequest')

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

      performance.mark('DandiRouteExecutor.execRoute', 'beforeHandleRequest')
      await Disposable.useAsync(this.injector.createChild(createHttpRequestScope(req), requestProviders), async requestInjector => {
        await requestInjector.invoke(this as DandiRouteExecutor, 'checkAuthorizationConditions')
        await requestInjector.invoke(this.pipeline, 'handleRequest')
      })
      performance.mark('DandiRouteExecutor.execRoute', 'afterHandleRequest')

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

      res
        .status(err.statusCode || HttpStatusCode.internalServerError)
        .send(JSON.stringify({
          error: {
            type: err.constructor.name,
            message: err.message,
          },
        }))
    } finally {
      this.logger.debug(
        `end execRoute ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )

      performance.mark('DandiRouteExecutor.execRoute', 'end')
      this.logger.debug(performance.toString())
    }
  }

  public checkAuthorizationConditions(
    @Inject(AuthorizationCondition) @Optional() conditions: AuthorizationCondition[],
  ): void {
    const denied = conditions?.filter((result) => !result.allowed) as DeniedAuthorization[]
    if (denied?.length) {
      throw new ForbiddenError(denied.map((d) => d.reason).join('; '))
    }
  }
}

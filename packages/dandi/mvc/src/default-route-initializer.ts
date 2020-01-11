import {
  Inject,
  Injectable,
  Logger,
  Optional,
  Provider,
} from '@dandi/core'
import { getInjectableMetadata } from '@dandi/core/internal/util'
import {
  HttpRequest,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpResponse,
} from '@dandi/http'
import { HttpRequestHandler, HttpRequestHandlerMethod, HttpRequestInfo } from '@dandi/http-pipeline'

import { AuthProviderFactory } from './auth-provider.factory'
import { Route } from './route'
import { RouteInitializationError } from './route-initialization.error'
import { RouteInitializer } from './route-initializer'
import { RequestController, HttpRequestId } from './tokens'

@Injectable(RouteInitializer)
export class DefaultRouteInitializer implements RouteInitializer {
  constructor(
    @Inject(Logger) private logger: Logger,
    @Inject(AuthProviderFactory)
    @Optional()
    private authProviderFactory?: AuthProviderFactory,
  ) {}

  public initRouteRequest(
    route: Route,
    req: HttpRequest,
    requestInfo: HttpRequestInfo,
    res: HttpResponse,
  ): Provider<any>[] {
    this.logger.debug(
      `begin initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )
    const providers: Provider<any>[] = []

    try {
      providers.push(...this.generateRequestProviders(route, req, res, requestInfo))
      providers.push(...this.generateAuthProviders(route, req))
      return providers
    } catch (err) {
      throw new RouteInitializationError(err, route)
    } finally {
      this.logger.debug(
        `end initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
        route.httpMethod.toUpperCase(),
        route.path,
      )
    }
  }

  /**
   * Registers standard providers for various parts of the request, as well as derivative value providers
   * specified by parameter decorators
   */
  private generateRequestProviders(
    route: Route,
    req: HttpRequest,
    res: HttpResponse,
    requestInfo: HttpRequestInfo,
  ): Provider<any>[] {
    const result: Provider<any>[] = [
      {
        provide: HttpRequest,
        useValue: req,
      },
      {
        provide: HttpResponse,
        useValue: res,
      },
      {
        provide: Route,
        useValue: route,
      },
      {
        provide: RequestController,
        useClass: route.controllerCtr,
      },
      {
        provide: HttpRequestHandler,
        useClass: route.controllerCtr,
      },
      {
        provide: HttpRequestHandlerMethod,
        useValue: route.controllerMethod,
      },
      { provide: HttpRequestPathParamMap, useValue: req.params },
      { provide: HttpRequestQueryParamMap, useValue: req.query },
      { provide: HttpRequestId, useValue: requestInfo.requestId },
      { provide: HttpRequestInfo, useValue: requestInfo },
    ]

    // registers value providers from @PathParam, @QueryParam, @RequestBody decorators
    const meta = getInjectableMetadata(route.controllerCtr.prototype[route.controllerMethod])
    for (const param of meta.params) {
      result.push(...param.providers || [])
    }
    return result
  }

  private generateAuthProviders(route: Route, req: HttpRequest): Provider<any>[] {
    if (!this.authProviderFactory) {
      return []
    }
    return this.authProviderFactory.generateAuthProviders(route, req)
  }
}

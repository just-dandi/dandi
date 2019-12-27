import {
  getInjectableMetadata,
  Inject,
  Injectable,
  Logger,
  Optional,
  Provider,
  Injector,
} from '@dandi/core'
import {
  ForbiddenError,
  HttpRequest,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpResponse,
} from '@dandi/http'
import { HttpRequestHandler, HttpRequestHandlerMethod, HttpRequestInfo } from '@dandi/http-pipeline'

import { AuthProviderFactory } from './auth-provider.factory'
import { AuthorizationCondition, DeniedAuthorization } from './authorization.condition'
import { RequestProviderRegistrar } from './request-provider-registrar'
import { Route } from './route'
import { RouteInitializationError } from './route-initialization.error'
import { RouteInitializer } from './route-initializer'
import { RequestController, HttpRequestId } from './tokens'

@Injectable(RouteInitializer)
export class DefaultRouteInitializer implements RouteInitializer {
  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(RequestProviderRegistrar)
    @Optional()
    private registrars: RequestProviderRegistrar[],
    @Inject(Logger) private logger: Logger,
    @Inject(AuthProviderFactory)
    @Optional()
    private authProviderFactory?: AuthProviderFactory,
  ) {}

  public async initRouteRequest(
    route: Route,
    req: HttpRequest,
    requestInfo: HttpRequestInfo,
    res: HttpResponse,
  ): Promise<Provider<any>[]> {
    this.logger.debug(
      `begin initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )
    const providers: Provider<any>[] = []

    try {
      providers.push(...this.generateRequestProviders(route, req, requestInfo, res))
      providers.push(...(await this.generateAuthProviders(route, req)))
      providers.push(...(await this.generateRequestRegistrarProviders(providers)))
      await this.handleAuthorizationConditions(providers)
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
    requestInfo: HttpRequestInfo,
    res: HttpResponse,
  ): Provider<any>[] {
    const result: Provider<any>[] = [
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
      { provide: HttpRequest, useValue: req },
      { provide: HttpResponse, useValue: res },
      { provide: HttpRequestPathParamMap, useValue: req.params },
      { provide: HttpRequestQueryParamMap, useValue: req.query },
      { provide: Route, useValue: route },
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

  private async generateAuthProviders(route: Route, req: HttpRequest): Promise<Provider<any>[]> {
    if (!this.authProviderFactory) {
      return []
    }
    return this.authProviderFactory.generateAuthProviders(route, req)
  }

  private async handleAuthorizationConditions(providers: Provider<any>[]): Promise<void> {
    const results = await this.injector.inject(AuthorizationCondition, true, ...providers)
    if (!results) {
      return
    }

    const denied = results.arrayValue.filter((result) => !result.allowed) as DeniedAuthorization[]
    if (denied.length) {
      throw new ForbiddenError(denied.map((d) => d.reason).join('; '))
    }
  }

  private async generateRequestRegistrarProviders(providers: Provider<any>[]): Promise<Provider<any>[]> {
    if (!this.registrars) {
      return []
    }
    return (await Promise.all(this.registrars.map(async (registrar: RequestProviderRegistrar) =>
      await this.injector.invoke<RequestProviderRegistrar, Provider<any>[]>(registrar, 'provide', ...providers)),
    ))
      .reduce((result, providers) => {
        result.push(...providers || [])
        return result
      }, [])
  }
}

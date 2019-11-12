import {
  getInjectableMetadata,
  Inject,
  Injectable,
  Logger,
  Optional,
  Provider,
  Injector,
} from '@dandi/core'

import { AuthProviderFactory } from './auth.provider.factory'
import { AuthorizationCondition, DeniedAuthorization } from './authorization.condition'
import { ForbiddenError } from './errors'
import { MvcRequest } from './mvc.request'
import { MvcResponse } from './mvc.response'
import { RequestInfo } from './request.info'
import { RequestProviderRegistrar } from './request.provider.registrar'
import { Route } from './route'
import { RouteInitializationError } from './route.initialization.error'
import { RouteInitializer } from './route.initializer'
import { HttpRequestId, RequestController, RequestPathParamMap, RequestQueryParamMap } from './tokens'

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
    req: MvcRequest,
    requestInfo: RequestInfo,
    res: MvcResponse,
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
    req: MvcRequest,
    requestInfo: RequestInfo,
    res: MvcResponse,
  ): Provider<any>[] {
    const result: Provider<any>[] = [
      {
        provide: RequestController,
        useClass: route.controllerCtr,
      },
      { provide: MvcRequest, useValue: req },
      { provide: MvcResponse, useValue: res },
      { provide: RequestPathParamMap, useValue: req.params },
      { provide: RequestQueryParamMap, useValue: req.query },
      { provide: Route, useValue: route },
      { provide: HttpRequestId, useValue: requestInfo.requestId },
      { provide: RequestInfo, useValue: requestInfo },
    ]

    // registers value providers from @PathParam, @QueryParam, @RequestBody decorators
    const meta = getInjectableMetadata(route.controllerCtr.prototype[route.controllerMethod])
    for (const param of meta.params) {
      result.push(...param.providers || [])
    }
    return result
  }

  private async generateAuthProviders(route: Route, req: MvcRequest): Promise<Provider<any>[]> {
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
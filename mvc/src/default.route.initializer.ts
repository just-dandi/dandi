import {
  getInjectableMetadata,
  Inject,
  Injectable,
  Logger,
  Optional,
  Provider,
  Repository,
  Resolver,
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
    @Inject(Resolver) private resolver: Resolver,
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
  ): Promise<Repository> {
    this.logger.debug(
      `begin initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod.toString()}:`,
      route.httpMethod.toUpperCase(),
      route.path,
    )

    const repo = Repository.for(req)

    try {
      this.registerRequestProviders(repo, route, req, requestInfo, res)
      await this.registerAuthProviders(repo, route, req)
      await this.registerRequestRegistrarProviders(repo)
      await this.handleAuthorizationConditions(repo)

      return repo
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
  private registerRequestProviders(
    repo: Repository,
    route: Route,
    req: MvcRequest,
    requestInfo: RequestInfo,
    res: MvcResponse,
  ): void {
    repo.register(route.controllerCtr, { provide: RequestController })
    repo.registerProviders(
      { provide: MvcRequest, useValue: req },
      { provide: MvcResponse, useValue: res },
      { provide: RequestPathParamMap, useValue: req.params },
      { provide: RequestQueryParamMap, useValue: req.query },
      { provide: Route, useValue: route },
      { provide: HttpRequestId, useValue: requestInfo.requestId },
      { provide: RequestInfo, useValue: requestInfo },
    )

    // registers value providers from @PathParam, @QueryParam, @RequestBody decorators
    const meta = getInjectableMetadata(route.controllerCtr.prototype[route.controllerMethod])
    meta.params.forEach((param) => {
      if (param.providers) {
        repo.registerProviders(...param.providers)
      }
    })
  }

  private async registerAuthProviders(repo: Repository, route: Route, req: MvcRequest): Promise<void> {
    if (!this.authProviderFactory) {
      return
    }
    const providers = await this.authProviderFactory.createAuthProviders(route, req)
    repo.registerProviders(...providers)
  }

  private async handleAuthorizationConditions(repo: Repository): Promise<void> {
    const results = await this.resolver.resolve(AuthorizationCondition, true, repo)
    if (!results) {
      return
    }

    const denied = results.arrayValue.filter((result) => !result.allowed) as DeniedAuthorization[]
    if (denied.length) {
      throw new ForbiddenError(denied.map((d) => d.reason).join('; '))
    }
  }

  private async registerRequestRegistrarProviders(repo: Repository): Promise<void> {
    if (!this.registrars) {
      return
    }
    await Promise.all(
      this.registrars.map(async (registrar: RequestProviderRegistrar) => {
        const providers = (await this.resolver.invoke(registrar, registrar.provide, repo)) as Array<Provider<any>>
        if (providers) {
          repo.registerProviders(...providers)
        }
      }),
    )
  }
}

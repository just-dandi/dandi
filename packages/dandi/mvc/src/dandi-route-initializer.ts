import { Inject, Injectable, Logger, Optional, Provider, Injector } from '@dandi/core'
import { getInjectableMetadata } from '@dandi/core/internal/util'
import {
  createHttpRequestScope,
  HttpHeader,
  HttpMethod,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  HttpResponse,
  requestHeaderProvider,
  requestHeaderToken,
} from '@dandi/http'
import {
  CorsAllowCredentials,
  CorsAllowMethods,
  CorsAllowOrigin,
  CorsAllowRequest,
  CorsExposeHeaders,
  CorsHeaderValues,
  CorsMaxAge,
  CorsOriginWhitelist,
  CorsOriginWhitelistProvider,
  corsRequestAllowed,
  HttpRequestHandler,
  HttpRequestHandlerMethod,
  HttpRequestInfo,
} from '@dandi/http-pipeline'

import { AuthProviderFactory } from './auth-provider.factory'
import { Route } from './route'
import { RouteInitializationError } from './route-initialization.error'
import { RouteInitializer } from './route-initializer'
import { HttpRequestId, RequestController } from './tokens'

@Injectable(RouteInitializer)
export class DandiRouteInitializer implements RouteInitializer {
  constructor(
    @Inject(Injector) private injector: Injector,
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
      providers.push(...this.generateCorsProviders(route, req))
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
        useValue: (() => {
          const header = res.header.bind(res)
          return Object.assign(res, {
            header: (field: string, value: string): HttpResponse => {
              const normalizedField = field.replace(/(^\w|-\w)/g, m => m.toLocaleUpperCase())
              header(normalizedField, value)
              return res
            },
          })
        })(),
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

  private generateCorsProviders(route: Route, req?: HttpRequest): Provider<any>[] {
    if (!route.cors) {
      return []
    }

    const results = []

    if (req) {
      results.push({
        provide: CorsAllowMethods,
        useFactory: this.determineAllowedMethods.bind(this, [...route.siblingRoutes.values()], req),
        async: true,
      })
    }

    if (route.cors === true) {
      return results
    }

    if (route.cors.allowCredentials) {
      results.push({
        provide: CorsAllowCredentials,
        useValue: true,
      })
    }

    if (route.cors.allowOrigin) {
      if (typeof route.cors.allowOrigin === 'function') {
        results.push({
          provide: CorsAllowOrigin,
          useFactory: route.cors.allowOrigin,
          deps: [
            requestHeaderToken(HttpHeader.origin),
          ],
          providers: [
            requestHeaderProvider(HttpHeader.origin),
          ],
        })
      } else {
        results.push(
          {
            provide: CorsOriginWhitelist,
            useValue: route.cors.allowOrigin,
          },
          CorsOriginWhitelistProvider,
        )
      }
    }

    if (route.cors.exposeHeaders) {
      results.push({
        provide: CorsExposeHeaders,
        useValue: route.cors.exposeHeaders,
      })
    }

    if (typeof route.cors.maxAge !== 'undefined') {
      results.push({
        provide: CorsMaxAge,
        useValue: route.cors.maxAge,
      })
    }

    return results
  }

  private async determineAllowedMethods(siblingRoutes: Route[], req: HttpRequest): Promise<HttpMethod[]> {
    const allowedMethods = await Promise.all(siblingRoutes.map(async siblingRoute => {
      const siblingRequest = Object.assign({
        get: (key: string) => req.get(key),
      }, req)
      const providers = this.generateCorsProviders(siblingRoute).concat([
        {
          provide: HttpRequest,
          useValue: siblingRequest,
        },
        {
          provide: CorsAllowMethods,
          useValue: [siblingRoute.httpMethod],
        },
        {
          provide: CorsAllowRequest,
          useFactory: corsRequestAllowed,
          deps: [CorsHeaderValues, HttpRequestHeadersAccessor],
        },
      ])
      const childInjector = this.injector.app.createChild(createHttpRequestScope(this, 'determineAllowedMethod'), providers)
      if ((await childInjector.inject(CorsAllowRequest))?.singleValue) {
        return siblingRoute.httpMethod
      }
      return undefined
    }))
    return allowedMethods.filter(method => !!method)
  }
}

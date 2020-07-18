import { ClassProvider, Inject, Injectable, Logger, Optional } from '@dandi/core'
import { Repository } from '@dandi/core/internal'
import { HttpMethod } from '@dandi/http'

import { mergeAuthorization } from './authorization-metadata'
import { Controller } from './controller-decorator'
import { getControllerMetadata } from './controller-metadata'
import { getCorsConfig } from './cors.decorator'
import { Route } from './route'
import { RouteGenerator } from './route-generator'
import { RouteGeneratorError } from './route-generator.error'
import { RouteTransformer } from './route-transformer'

@Injectable(RouteGenerator)
export class DandiRouteGenerator implements RouteGenerator {
  constructor(
    @Inject(Logger) private logger: Logger,
    @Inject(RouteTransformer) @Optional() private readonly routeTransformers?: RouteTransformer[],
  ) {
    if (!this.routeTransformers) {
      this.routeTransformers = []
    }
  }

  public generateRoutes(): Route[] {
    this.logger.debug('generating routes...')

    const routes: Route[] = []
    const routesByPath = new Map<string, Map<HttpMethod, Route>>()

    for (const controllerEntry of Repository.for(Controller).providers) {
      const controllerProvider = controllerEntry as ClassProvider<any>
      const controllerCtr = controllerProvider.useClass
      const meta = getControllerMetadata(controllerCtr)
      const controllerCors = meta.cors

      this.logger.debug('found controller', controllerCtr.name)

      for (const [controllerMethod, controllerMethodMetadata] of meta.routeMap.entries()) {
        const authorizationMeta = mergeAuthorization(meta, controllerMethodMetadata)
        const authorization = authorizationMeta && authorizationMeta.authorization
        const methodCors = controllerMethodMetadata.cors
        const cors = getCorsConfig(controllerCors, methodCors)

        for (const [methodPath, httpMethods] of controllerMethodMetadata.routePaths.entries()) {
          const path = this.normalizePath(meta.path, methodPath)
          let pathRoutes = routesByPath.get(path)
          if (!pathRoutes) {
            pathRoutes = new Map<HttpMethod, Route>()
            routesByPath.set(path, pathRoutes)
          }

          httpMethods.forEach((httpMethod) => {
            this.logger.debug(
              `generated route for ${controllerCtr.name}.${controllerMethod.toString()}:`,
              httpMethod.toUpperCase(),
              path,
            )

            if (pathRoutes.has(httpMethod)) {
              const existing = pathRoutes.get(httpMethod)
              const locA = `${existing.controllerCtr.name}.${existing.controllerMethod.toString()}`
              const locB = `${controllerCtr.name}.${controllerMethod.toString()}`
              throw new RouteGeneratorError(`The path ${path} has conflicting routes configured in ${locA} and ${locB}`)
            }

            const route = (this.routeTransformers || []).reduce(
              (route, tranformer) => tranformer.transform(route, meta, controllerMethodMetadata),
              {
                httpMethod,
                siblingMethods: httpMethods,
                siblingRoutes: routesByPath.get(path),
                path,
                cors,
                controllerCtr,
                controllerMethod,
                authorization,
              },
            )

            pathRoutes.set(httpMethod, route)
            routes.push(route)
          })
        }
      }
    }

    return routes
  }

  private normalizePath(a: string, b: string): string {
    let result = a
    if (!a.startsWith('/')) {
      result = `/${a}`
    }
    if (!a.endsWith('/') && b) {
      result += '/'
    }
    result += b.startsWith('/') ? b.substring(1) : b
    return result
  }
}

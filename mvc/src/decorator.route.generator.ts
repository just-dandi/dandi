import { ClassProvider, Inject, Injectable, Logger, Repository } from '@dandi/core';

import { mergeAuthorization } from './authorization.metadata';
import { Controller } from './controller.decorator';
import { getControllerMetadata } from './controller.metadata';
import { Route } from './route';
import { RouteGenerator } from './route.generator';
import { getCorsConfig } from './cors.decorator';

@Injectable(RouteGenerator)
export class DecoratorRouteGenerator implements RouteGenerator {
  constructor(@Inject(Logger) private logger: Logger) {}

  public generateRoutes(): Route[] {
    this.logger.debug('generating routes...');

    const routes: Route[] = [];

    for (const controllerEntry of Repository.for(Controller).entries()) {
      const controllerProvider = controllerEntry as ClassProvider<any>;
      const controllerCtr = controllerProvider.useClass;
      const meta = getControllerMetadata(controllerCtr);
      const controllerCors = meta.cors;

      this.logger.debug('found controller', controllerCtr.name);

      for (const [controllerMethod, controllerMethodMetadata] of meta.routeMap.entries()) {
        const authorizationMeta = mergeAuthorization(meta, controllerMethodMetadata);
        const authorization = authorizationMeta && authorizationMeta.authorization;
        const methodCors = controllerMethodMetadata.cors;
        const cors = getCorsConfig(controllerCors, methodCors);

        for (const [methodPath, httpMethods] of controllerMethodMetadata.routePaths.entries()) {
          const path = this.normalizePath(meta.path, methodPath);

          httpMethods.forEach((httpMethod) => {
            this.logger.debug(
              `generated route for ${controllerCtr.name}.${controllerMethod.toString()}:`,
              httpMethod.toUpperCase(),
              path,
            );

            routes.push({
              httpMethod,
              siblingMethods: httpMethods,
              path,
              cors,
              controllerCtr,
              controllerMethod,
              authorization,
            });
          });
        }
      }
    }

    return routes;
  }

  private normalizePath(a: string, b: string): string {
    let result = a;
    if (!a.startsWith('/')) {
      result = `/${a}`;
    }
    if (!a.endsWith('/')) {
      result += '/';
    }
    result += b.startsWith('/') ? b.substring(1) : b;
    return result;
  }
}

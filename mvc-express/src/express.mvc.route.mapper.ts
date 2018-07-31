import { Inject, Injectable, Logger, Resolver } from '@dandi/core';
import {
  CorsConfig,
  HttpMethod,
  Route,
  RouteExecutor,
  RouteMapper,
} from '@dandi/mvc';

import * as cors from 'cors';
import { Express } from 'express';
import { Request, Response } from 'express-serve-static-core';

import { ExpressInstance } from './tokens';

function hasCorsConfig(obj: any): obj is CorsConfig {
  return typeof obj === 'object';
}

@Injectable(RouteMapper)
export class ExpressMvcRouteMapper implements RouteMapper {
  private readonly corsRoutes = new Set<string>();

  constructor(
    @Inject(Resolver) private resolver: Resolver,
    @Inject(ExpressInstance) private app: Express,
    @Inject(RouteExecutor) private routeExecutor: RouteExecutor,
    @Inject(Logger) private logger: Logger,
  ) {
    this.app.use((req: Request, res: Response, next: () => void) => {
      this.logger.debug('received request', req.method.toUpperCase(), req.path);
      next();
    });
  }

  public mapRoute(route: Route): void {
    this.logger.debug(
      'mapping route',
      route.httpMethod.toUpperCase(),
      route.path,
      'to',
      `${route.controllerCtr.name}.${route.controllerMethod}`,
      route.cors,
    );

    if (route.cors && !this.corsRoutes.has(route.path)) {
      const corsConfig = hasCorsConfig(route.cors) ? route.cors : undefined;
      if (
        !hasCorsConfig(route.cors) ||
        (route.cors.disablePreflight !== true &&
          route.httpMethod !== HttpMethod.options)
      ) {
        this.logger.debug(
          'mapping route',
          HttpMethod.options.toUpperCase(),
          route.path,
          'to cors',
          corsConfig || '(default)',
        );
        this.app[HttpMethod.options](
          route.path,
          cors(Object.assign({}, corsConfig)),
          () => {
            console.log('OPTIONS!');
          },
        );
      }
      this.app.use(route.path, cors(corsConfig));
      this.corsRoutes.add(route.path);
    }

    this.app[route.httpMethod](
      route.path,
      this.routeExecutor.execRoute.bind(this.routeExecutor, route),
    );
  }
}

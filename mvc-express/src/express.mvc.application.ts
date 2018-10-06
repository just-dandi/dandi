import { Constructor } from '@dandi/common';
import { Bootstrapper, Inject, Injectable, Logger, Provider } from '@dandi/core';
import { Validation } from '@dandi/model-builder';
import { Route, RouteExecutor, RouteGenerator, RouteHandler, RouteInitializer, RouteMapper, Routes } from '@dandi/mvc';

import * as bodyParser from 'body-parser';
import { Express } from 'express';

import { ExpressMvcConfig } from './express.mvc.config';
import { ExpressInstance } from './tokens';

export interface ExpressMvcApplicationConfig {
  expressInstanceProvider: Provider<Express>;
  routeExecutor: Constructor<RouteExecutor>;
  routeGenerator: Constructor<RouteGenerator>;
  routeHandler: Constructor<RouteHandler>;
  routeInitializer: Constructor<RouteInitializer>;
  routeMapper: Constructor<RouteMapper>;
  bootstrap: Constructor<Bootstrapper>;
  config: Provider<ExpressMvcConfig>;
  routesProvider: Provider<Route[]>;
}
export type ExpressMvcApplicationOptions = {
  [P in keyof ExpressMvcApplicationConfig]?: ExpressMvcApplicationConfig[P]
};

@Injectable(Bootstrapper)
export class ExpressMvcApplication implements Bootstrapper {
  public static config(options: ExpressMvcApplicationOptions): Array<Provider<any>> {
    const config: ExpressMvcApplicationConfig = {
      expressInstanceProvider:
        options.expressInstanceProvider || require('./default.express.provider').DEFAULT_EXPRESS_PROVIDER,
      routeExecutor: options.routeExecutor || require('@dandi/mvc').DefaultRouteExecutor,
      routeGenerator: options.routeGenerator || require('@dandi/mvc').DecoratorRouteGenerator,
      routeHandler: options.routeHandler || require('@dandi/mvc').DefaultRouteHandler,
      routeInitializer: options.routeInitializer || require('@dandi/mvc').DefaultRouteInitializer,
      routeMapper: options.routeMapper || require('./express.mvc.route.mapper').ExpressMvcRouteMapper,
      bootstrap: ExpressMvcApplication,
      config: options.config,
      routesProvider: options.routesProvider || require('@dandi/mvc').ROUTES_PROVIDER,
    };
    return Object.values(config).concat(Validation);
  }

  public static defaults(mvcConfig: ExpressMvcConfig): Array<Provider<any>> {
    return ExpressMvcApplication.config({
      config: { provide: ExpressMvcConfig, useValue: mvcConfig },
    });
  }

  /**
   * defaults
   * {
   *      express: DEFAULT_EXPRESS_PROVIDER,
   *      port: 8000,
   *      routeHandler: DefaultMvcRouteHandler,
   *  }
   */

  constructor(
    @Inject(ExpressInstance) private app: Express,
    @Inject(ExpressMvcConfig) private config: ExpressMvcConfig,
    @Inject(Routes) private routes: Route[],
    @Inject(RouteMapper) private routeMapper: RouteMapper,
    @Inject(Logger) private logger: Logger,
  ) {}

  public start(): void {
    // TODO: integrate @RequestBody into a reviver?
    // see https://github.com/expressjs/body-parser#reviver
    this.app.use(bodyParser.json());

    for (const route of this.routes) {
      this.routeMapper.mapRoute(route);
    }

    this.logger.debug('starting on port', this.config.port);
    this.app.listen(this.config.port, '0.0.0.0');
  }
}

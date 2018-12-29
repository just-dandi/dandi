import { Constructor } from '@dandi/common'
import { Bootstrapper, ModuleBuilder, Provider, Registerable } from '@dandi/core'
import { Route, RouteExecutor, RouteGenerator, RouteHandler, RouteInitializer, RouteMapper } from '@dandi/mvc'
import { Express } from 'express'

import { ExpressMvcConfig } from './express.mvc.config'
import { PKG } from './local.token'

export interface ExpressMvcApplicationConfig {
  expressInstanceProvider: Provider<Express>;
  routeExecutor: Constructor<RouteExecutor>;
  routeGenerator: Constructor<RouteGenerator>;
  routeHandler: Constructor<RouteHandler>;
  routeInitializer: Constructor<RouteInitializer>;
  routeMapper: Constructor<RouteMapper>;
  bootstrap: Constructor<Bootstrapper>;
  routesProvider: Provider<Route[]>;
}
export type ExpressMvcApplicationOptions = {
  [P in keyof ExpressMvcApplicationConfig]?: ExpressMvcApplicationConfig[P]
}

export class MvcExpressModuleBuilder extends ModuleBuilder<MvcExpressModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcExpressModuleBuilder, PKG, ...entries)
  }

  private getConfiguredRegisterables(options: ExpressMvcApplicationOptions) {
    const config: ExpressMvcApplicationConfig = {
      expressInstanceProvider:
        options.expressInstanceProvider || require('./default.express.provider').DEFAULT_EXPRESS_PROVIDER,
      routeExecutor: options.routeExecutor || require('@dandi/mvc').DefaultRouteExecutor,
      routeGenerator: options.routeGenerator || require('@dandi/mvc').DecoratorRouteGenerator,
      routeHandler: options.routeHandler || require('@dandi/mvc').DefaultRouteHandler,
      routeInitializer: options.routeInitializer || require('@dandi/mvc').DefaultRouteInitializer,
      routeMapper: options.routeMapper || require('./express.mvc.route.mapper').ExpressMvcRouteMapper,
      bootstrap: options.bootstrap || require('./express.mvc.application').ExpressMvcApplication,
      routesProvider: options.routesProvider || require('@dandi/mvc').ROUTES_PROVIDER,
    }
    return Object.values(config).filter((v) => v)
  }

  public providers(options: ExpressMvcApplicationOptions = {}): this {
    return this.add(...this.getConfiguredRegisterables(options))
  }

  public config(mvcConfig: ExpressMvcConfig): this {
    return this.add({ provide: ExpressMvcConfig, useValue: mvcConfig })
  }
}

export class MvcExpressModule {
  public static withProviders(options: ExpressMvcApplicationOptions): MvcExpressModuleBuilder {
    return new MvcExpressModuleBuilder().providers(options)
  }

  public static withDefaults(): MvcExpressModuleBuilder {
    return new MvcExpressModuleBuilder().providers()
  }
}

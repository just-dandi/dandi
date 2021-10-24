import { Server } from 'http'

import { EntryPoint, Inject, Injectable, Injector, Logger } from '@dandi/core'
import { HttpServer } from '@dandi/http-pipeline'
import { Route, RouteMapper, Routes } from '@dandi/mvc'

import * as bodyParser from 'body-parser'
import { Express } from 'express'

import { ExpressInstance } from './express-instance'

@Injectable(EntryPoint)
export class ExpressMvcApplication implements EntryPoint<Server> {
  constructor(
    @Inject(ExpressInstance) private app: Express,
    @Inject(Routes) private routes: Route[],
    @Inject(RouteMapper) private routeMapper: RouteMapper,
    @Inject(Injector) private injector: Injector,
    @Inject(Logger) private logger: Logger,
  ) {}

  public async run(): Promise<Server> {
    this.app.use(bodyParser.raw({ type: '*/*' }))

    for (const route of this.routes) {
      this.routeMapper.mapRoute(route)
    }

    return await this.injector.inject(HttpServer)
  }
}

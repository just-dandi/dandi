import { EntryPoint, Inject, Injectable, Logger } from '@dandi/core'
import { Route, RouteMapper, Routes } from '@dandi/mvc'

import * as bodyParser from 'body-parser'
import { Express } from 'express'

import { ExpressInstance } from './express-instance'
import { ExpressMvcConfig } from './express-mvc-config'

@Injectable(EntryPoint)
export class ExpressMvcApplication implements EntryPoint {
  constructor(
    @Inject(ExpressInstance) private app: Express,
    @Inject(ExpressMvcConfig) private config: ExpressMvcConfig,
    @Inject(Routes) private routes: Route[],
    @Inject(RouteMapper) private routeMapper: RouteMapper,
    @Inject(Logger) private logger: Logger,
  ) {}

  public run(): void {
    this.app.use(bodyParser.raw({ type: '*/*' }))

    for (const route of this.routes) {
      this.routeMapper.mapRoute(route)
    }

    this.logger.debug(`starting on ${this.config.host}:${this.config.port}`)
    this.app.listen(this.config.port, this.config.host)
    this.logger.info(`listening on http://${this.config.host}:${this.config.port}`)
  }
}

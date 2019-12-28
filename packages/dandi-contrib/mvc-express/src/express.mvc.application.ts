import { EntryPoint, Inject, Injectable, Logger } from '@dandi/core'
import { Route, RouteMapper, Routes } from '@dandi/mvc'

import * as bodyParser from 'body-parser'
import { Express } from 'express'

import { ExpressMvcConfig } from './express.mvc.config'
import { ExpressInstance } from './tokens'

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

    this.logger.debug('starting on port', this.config.port)
    this.app.listen(this.config.port, '0.0.0.0')
  }
}

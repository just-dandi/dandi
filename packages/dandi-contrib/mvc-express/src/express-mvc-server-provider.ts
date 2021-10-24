import { ExpressMvcConfig } from '@dandi-contrib/mvc-express'
import { Logger } from '@dandi/core'
import { HttpServer } from '@dandi/http-pipeline'
import { Express } from 'express'

import { ExpressInstance } from './express-instance'

function expressMvcServerFactory(app: Express, config: ExpressMvcConfig, logger: Logger): HttpServer {
  logger.debug(`starting on ${config.host}:${config.port}`)
  const server = app.listen(config.port, config.host)
  logger.info(`listening on http://${config.host}:${config.port}`)
  return server
}

export const ExpressMvcServerProvider = {
  provide: HttpServer,
  useFactory: expressMvcServerFactory,
  deps: [ExpressInstance, ExpressMvcConfig, Logger],
}

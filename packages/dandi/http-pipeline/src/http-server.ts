import { Server as NodeHttpServer } from 'http'
import { Server as NodeHttpsServer } from 'https'

import { localToken } from './local-token'

export type HttpServer = NodeHttpServer | NodeHttpsServer

export const HttpServer = localToken.opinionated<HttpServer>('HttpServer', {
  multi: false,
})

const start = new Date().valueOf()

import { config } from 'dotenv'

import { server } from './src/server.application'

config()
;(async () => await server.start(start))()

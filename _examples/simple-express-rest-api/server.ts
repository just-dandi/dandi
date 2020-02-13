const start = new Date().valueOf()

import { server } from './src/server.application'

(async () => await server.start(start))()

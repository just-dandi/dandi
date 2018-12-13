const start = new Date().valueOf()
import { server } from './src/server.container';

(async () => await server.start(start))()

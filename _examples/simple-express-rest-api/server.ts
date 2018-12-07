import { server } from './src/server.container';

(async () => {
  console.log(`${new Date().toISOString()} [simple-express-rest-api] starting server`)
  await server.start()
  console.log(`${new Date().toISOString()} [simple-express-rest-api] server started`)
})()

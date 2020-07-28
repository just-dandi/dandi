import { localToken } from './local-token'
import { Route } from './route'

export interface RouteGenerator {
  generateRoutes(): Route[]
}

export const RouteGenerator = localToken.opinionated<RouteGenerator>('RouteGenerator', {
  multi: false,
})

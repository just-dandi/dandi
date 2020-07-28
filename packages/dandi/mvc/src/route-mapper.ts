import { localToken } from './local-token'
import { Route } from './route'

export interface RouteMapper {
  mapRoute(route: Route): void
}

export const RouteMapper = localToken.opinionated<RouteMapper>('RouteMapper', {
  multi: false,
})

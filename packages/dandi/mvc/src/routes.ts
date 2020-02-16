import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { Route } from './route'
import { RouteGenerator } from './route-generator'

export const Routes: InjectionToken<Route[]> = localOpinionatedToken('Routes', {
  multi: false,
})

export const ROUTES_PROVIDER: Provider<Route[]> = {
  provide: Routes,
  useFactory(routeGenerator: RouteGenerator) {
    return routeGenerator.generateRoutes()
  },
  deps: [RouteGenerator],
}

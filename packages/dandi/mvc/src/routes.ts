import { Provider } from '@dandi/core'

import { localToken } from './local-token'
import { Route } from './route'
import { RouteGenerator } from './route-generator'

export const Routes = localToken.opinionated<Route[]>('Routes', {
  multi: false,
})

export const ROUTES_PROVIDER: Provider<Route[]> = {
  provide: Routes,
  useFactory(routeGenerator: RouteGenerator) {
    return routeGenerator.generateRoutes()
  },
  deps: [RouteGenerator],
}

import { InjectionToken } from '@dandi/core'

import { localToken } from './local-token'
import { Route } from './route'

export interface RouteGenerator {
  generateRoutes(): Route[]
}

export const RouteGenerator: InjectionToken<RouteGenerator> = localToken.opinionated<RouteGenerator>(
  'RouteGenerator',
  {
    multi: false,
  },
)

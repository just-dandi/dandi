import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest, HttpResponse } from '@dandi/http'
import { HttpRequestInfo } from '@dandi/http-pipeline'

import { localToken } from './local-token'
import { Route } from './route'

export interface RouteInitializer {
  initRouteRequest(
    route: Route,
    req: HttpRequest,
    requestInfo: HttpRequestInfo,
    res: HttpResponse,
  ): Provider<any>[]
}

export const RouteInitializer: InjectionToken<RouteInitializer> = localToken.opinionated<RouteInitializer>(
  'RouteInitializer',
  {
    multi: false,
  },
)

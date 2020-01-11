import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest, HttpResponse } from '@dandi/http'
import { HttpRequestInfo } from '@dandi/http-pipeline'

import { localOpinionatedToken } from './local.token'
import { Route } from './route'

export interface RouteInitializer {
  initRouteRequest(route: Route, req: HttpRequest, requestInfo: HttpRequestInfo, res: HttpResponse): Provider<any>[]
}

export const RouteInitializer: InjectionToken<RouteInitializer> = localOpinionatedToken<RouteInitializer>(
  'RouteInitializer',
  {
    multi: false,
  },
)

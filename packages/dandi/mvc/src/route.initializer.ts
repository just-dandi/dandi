import { InjectionToken, Provider } from '@dandi/core'
import { HttpRequest, HttpResponse } from '@dandi/http'

import { localOpinionatedToken } from './local.token'
import { RequestInfo } from './request.info'
import { Route } from './route'

export interface RouteInitializer {
  initRouteRequest(route: Route, req: HttpRequest, requestInfo: RequestInfo, res: HttpResponse): Promise<Provider<any>[]>
}

export const RouteInitializer: InjectionToken<RouteInitializer> = localOpinionatedToken<RouteInitializer>(
  'RouteInitializer',
  {
    multi: false,
  },
)

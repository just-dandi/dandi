import { HttpRequest, HttpResponse } from '@dandi/http'

import { localToken } from './local-token'
import { Route } from './route'

export interface RouteExecutor {
  execRoute(route: Route, req: HttpRequest, res: HttpResponse): Promise<any>
}

export const RouteExecutor = localToken.opinionated<RouteExecutor>('RouteExecutor', {
  multi: false,
})

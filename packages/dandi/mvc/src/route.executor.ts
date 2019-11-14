import { InjectionToken } from '@dandi/core'
import { HttpRequest, HttpResponse } from '@dandi/http'

import { localOpinionatedToken } from './local.token'
import { Route } from './route'

export interface RouteExecutor {
  execRoute(route: Route, req: HttpRequest, res: HttpResponse): Promise<any>;
}

export const RouteExecutor: InjectionToken<RouteExecutor> = localOpinionatedToken<RouteExecutor>('RouteExecutor', {
  multi: false,
})

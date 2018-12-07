import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { MvcRequest } from './mvc.request'
import { MvcResponse } from './mvc.response'
import { Route } from './route'

export interface RouteExecutor {
  execRoute(route: Route, req: MvcRequest, res: MvcResponse): Promise<any>;
}

export const RouteExecutor: InjectionToken<RouteExecutor> = localOpinionatedToken<RouteExecutor>('RouteExecutor', {
  multi: false,
})

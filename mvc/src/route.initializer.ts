import { InjectionToken, Repository } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { MvcRequest } from './mvc.request';
import { MvcResponse } from './mvc.response';
import { RequestInfo } from './request.info';
import { Route } from './route';

export interface RouteInitializer {
  initRouteRequest(
    route: Route,
    req: MvcRequest,
    requestInfo: RequestInfo,
    res: MvcResponse,
  ): Promise<Repository>;
}

export const RouteInitializer: InjectionToken<
  RouteInitializer
> = localOpinionatedToken<RouteInitializer>('RouteInitializer', {
  multi: false,
});

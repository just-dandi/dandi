import { InjectionToken, Provider } from '@dandi/core';
import { Route, RouteGenerator } from '@dandi/mvc';

import { localOpinionatedToken } from './local.token';

export const Routes: InjectionToken<Route[]> = localOpinionatedToken('Routes', {
  singleton: true,
  multi: false,
});

export const ROUTES_PROVIDER: Provider<Route[]> = {
  provide: Routes,
  useFactory(routeGenerator: RouteGenerator) {
    return routeGenerator.generateRoutes();
  },
  deps: [RouteGenerator],
};

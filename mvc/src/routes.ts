import { InjectionToken, Provider } from '@dandi/core';

import { Route } from './route';
import { RouteGenerator } from './route.generator';

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

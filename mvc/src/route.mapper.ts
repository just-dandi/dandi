import { InjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { Route }                 from './route';

export interface RouteMapper {
    mapRoute(route: Route): void;
}

export const RouteMapper: InjectionToken<RouteMapper> =
    localOpinionatedToken<RouteMapper>('RouteMapper', { multi: false });

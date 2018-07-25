import { InjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { Route }                 from './route';

export interface RouteGenerator {
    generateRoutes(): Route[];
}

export const RouteGenerator: InjectionToken<RouteGenerator> =
    localOpinionatedToken<RouteGenerator>('RouteGenerator', { multi: false });

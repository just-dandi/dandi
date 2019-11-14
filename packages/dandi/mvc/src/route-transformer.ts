import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { Route } from './route'
import { ControllerMetadata, ControllerMethodMetadata } from './controller-metadata'

export interface RouteTransformer {
  transform(route: Route, controllerMeta: ControllerMetadata, methodMeta: ControllerMethodMetadata): Route;
}

export const RouteTransformer: InjectionToken<RouteTransformer> = localOpinionatedToken('RouteTransformer', {
  multi: true,
})

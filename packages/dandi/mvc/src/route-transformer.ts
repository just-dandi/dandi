import { InjectionToken } from '@dandi/core'

import { ControllerMetadata, ControllerMethodMetadata } from './controller-metadata'
import { localOpinionatedToken } from './local.token'
import { Route } from './route'

export interface RouteTransformer {
  transform(route: Route, controllerMeta: ControllerMetadata, methodMeta: ControllerMethodMetadata): Route
}

export const RouteTransformer: InjectionToken<RouteTransformer> = localOpinionatedToken('RouteTransformer', {
  multi: true,
})

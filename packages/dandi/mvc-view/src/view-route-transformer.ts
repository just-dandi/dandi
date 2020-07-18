import { Injectable } from '@dandi/core'
import { ControllerMetadata, Route, RouteTransformer } from '@dandi/mvc'

import { ControllerViewMethodMetadata } from './view-metadata'
import { ViewRoute } from './view-route'

@Injectable(RouteTransformer)
export class ViewRouteTransformer implements RouteTransformer {
  public transform(
    route: ViewRoute,
    controllerMeta: ControllerMetadata,
    methodMeta: ControllerViewMethodMetadata,
  ): Route {
    if (methodMeta.views) {
      route.views = methodMeta.views
    }
    return route
  }
}

import { Constructor, getMetadata } from '@dandi/common'
import { HttpMethod } from '@dandi/http'

import { AuthorizationMetadata } from './authorization.metadata'
import { CorsConfig } from './cors.config'
import { ControllerMethod, RoutePath } from './http.method.decorator'
import { globalSymbol } from './global.symbol'
import { MvcMetadata } from './mvc.metadata'

export class RouteMap extends Map<ControllerMethod, ControllerMethodMetadata> {}
export interface ControllerMethodMetadata extends AuthorizationMetadata {
  routePaths?: RouteMapEntry;
  cors?: CorsConfig | true;
}
export class RouteMapEntry extends Map<RoutePath, Set<HttpMethod>> {}

const META_KEY = globalSymbol('meta:controller')

export interface ControllerMetadata extends MvcMetadata, AuthorizationMetadata {
  routeMap?: RouteMap;
}

export function getControllerMetadata(target: Constructor<any>): ControllerMetadata {
  return getMetadata(META_KEY, () => ({ routeMap: new RouteMap() }), target)
}

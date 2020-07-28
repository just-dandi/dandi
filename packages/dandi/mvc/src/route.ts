import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { HttpMethod, HttpRequestScope } from '@dandi/http'
import { CorsConfig } from '@dandi/http-pipeline'

import { AuthorizationCondition } from './authorization-condition'
import { localToken } from './local-token'

export interface Route<TController = any> {
  httpMethod: HttpMethod

  /**
   * A {@link Set} of {@link HttpMethod} also supported by the same controller method
   */
  siblingMethods: Set<HttpMethod>

  /**
   * A {@link Map} of {@link HttpMethod}s to {@link Route}s that share the same routing path
   *
   * Note: using different path variable names/regexp matching will cause the routes to be considered unrelated
   */
  siblingRoutes: Map<HttpMethod, Route>
  path: string
  controllerCtr: Constructor<TController>
  controllerMethod: keyof TController
  cors?: CorsConfig | true
  authorization?: Provider<AuthorizationCondition>[]
}

export const Route: InjectionToken<Route> = localToken.opinionated<Route>('Route', {
  multi: false,
  restrictScope: HttpRequestScope,
})

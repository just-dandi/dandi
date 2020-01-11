import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { HttpMethod, HttpRequestScope } from '@dandi/http'

import { AuthorizationCondition } from './authorization.condition'
import { CorsConfig } from './cors-config'
import { localOpinionatedToken } from './local.token'

export interface Route {
  httpMethod: HttpMethod
  siblingMethods: Set<HttpMethod>
  path: string
  controllerCtr: Constructor<any>
  controllerMethod: string | symbol
  cors?: CorsConfig | true
  authorization?: Array<Provider<AuthorizationCondition>>
}

export const Route: InjectionToken<Route> = localOpinionatedToken<Route>('Route', {
  multi: false,
  restrictScope: HttpRequestScope,
})

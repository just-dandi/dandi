import { CustomInjectionScope } from '@dandi/core'

import { HttpRequest } from './http-request'

const HTTP_REQUEST_SCOPE = '@dandi/http#HttpRequest'

export interface HttpRequestScope extends CustomInjectionScope {
  description: '@dandi/http#HttpRequest',
}

export interface HttpRequestScopeInstance extends HttpRequestScope {
  instanceId: any
}

export const HttpRequestScope: HttpRequestScope = {
  description: HTTP_REQUEST_SCOPE,
  type: Symbol.for(HTTP_REQUEST_SCOPE),
}

export function createHttpRequestScope(req: HttpRequest): HttpRequestScopeInstance {
  return Object.assign({ instanceId: req }, HttpRequestScope)
}

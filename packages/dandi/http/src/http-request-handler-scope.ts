import { Uuid } from '@dandi/common'
import { CustomInjectionScope, InvokeInjectionScope } from '@dandi/core'

const HTTP_REQUEST_HANDLER_SCOPE = '@dandi/http#HttpRequestHandler'

export interface HttpRequestHandlerScope extends CustomInjectionScope {
  description: '@dandi/http#HttpRequestHandler'
}

export interface HttpRequestHandlerScopeInstance extends HttpRequestHandlerScope, InvokeInjectionScope {
  instanceId: any
}

export const HttpRequestHandlerScope: HttpRequestHandlerScope = {
  description: HTTP_REQUEST_HANDLER_SCOPE,
  type: Symbol.for(HTTP_REQUEST_HANDLER_SCOPE),
}

export function createHttpRequestHandlerScope(instance: any, methodName: any): HttpRequestHandlerScopeInstance {
  return Object.assign({ instanceId: Uuid.create(), instance, methodName }, HttpRequestHandlerScope)
}


import { CUSTOM_INSPECTOR, Uuid } from '@dandi/common'
import { CustomInjectionScope, InvokeInjectionScope, Scope } from '@dandi/core'

const HTTP_REQUEST_SCOPE = '@dandi/http#HttpRequest'

export type HttpRequestScopeDecorator = () => MethodDecorator

export interface HttpRequestScopeDescription {
  description: '@dandi/http#HttpRequest'
  type: symbol
}

export type HttpRequestScope = CustomInjectionScope & HttpRequestScopeDecorator & HttpRequestScopeDescription

export interface HttpRequestScopeInstance extends HttpRequestScope, InvokeInjectionScope {
  instanceId: any
}

const DESCRIPTION: HttpRequestScopeDescription = {
  description: HTTP_REQUEST_SCOPE,
  type: Symbol.for(HTTP_REQUEST_SCOPE),
}

export const HttpRequestScope: HttpRequestScope = Object.defineProperties(
  Object.assign(

    /**
     * must be an arrow fn so isConstructor returns false when being checked by {@link scopesAreCompatible}
     */
    (): MethodDecorator => Scope(createHttpRequestScope),
    DESCRIPTION,
  ),
  {
    [CUSTOM_INSPECTOR]: {
      value: () => DESCRIPTION.description,
    },
    toString: {
      value: () => DESCRIPTION.description,
    },
  },
)

export function createHttpRequestScope(instance: any, methodName: any): HttpRequestScopeInstance {
  return Object.assign({ instanceId: Uuid.create(), instance, methodName }, HttpRequestScope)
}

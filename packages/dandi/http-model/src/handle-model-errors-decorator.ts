import { AppError, MethodTarget } from '@dandi/common'
import { Scope } from '@dandi/core'
import { getInjectableMetadata } from '@dandi/core/internal/util'
import { createHttpRequestHandlerScope } from '@dandi/http'

import { RequestModelErrorsMetadata, RequestModelErrors } from './request-model-errors-decorator'

/**
 * Method decorator for request handlers that adds the {@link HttpRequestHandlerScope}, and enables usage of the
 * {@link RequestModelErrors} decorator.
 *
 * See {@link RequestModelErrors} for more information about why this decorator is needed.
 */
export function HandleModelErrors(): MethodDecorator {
  const scopeDecorator = Scope(createHttpRequestHandlerScope)
  return function handleModelErrorsDecorator(target: MethodTarget, propertyKey: string): void {
    scopeDecorator(target, propertyKey, undefined)
    const methodMeta = getInjectableMetadata(target[propertyKey])
    const paramMeta = methodMeta.params.find(paramMeta => paramMeta.token === RequestModelErrors) as RequestModelErrorsMetadata

    if (!paramMeta) {
      throw new AppError(
        `${target.constructor.name}.${propertyKey} is decorated with @HandleModelErrors, ` +
        'but does not have a parameter decorated with @RequestModelErrors',
      )
    }

    paramMeta.methodProviders.splice(
      paramMeta.methodProviders.findIndex(provider => provider.provide === RequestModelErrors),
      1,
      paramMeta.createRequestModelErrorsProvider(),
    )
  }
}

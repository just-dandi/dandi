import { AppError, MethodTarget } from '@dandi/common'
import { OpinionatedToken, Provider } from '@dandi/core'
import { getInjectableMetadata, getInjectableParamMetadata, ParamMetadata } from '@dandi/core/internal/util'
import { HttpRequestHandlerScope } from '@dandi/http'
import { ModelErrors } from '@dandi/model-builder'

import { localToken } from './local-token'
import { RequestModelErrorsCollector } from './request-model-errors-collector'

export interface RequestModelErrors {
  params?: { [paramName: string]: ModelErrors }
  body?: ModelErrors
}

/**
 * @internal
 */
export interface RequestModelErrorsMetadata extends ParamMetadata<RequestModelErrors> {
  createRequestModelErrorsProvider(): Provider<RequestModelErrors>
}

function requestModelErrorsFactory(collector: RequestModelErrorsCollector): RequestModelErrors {
  return collector.compile()
}

export interface RequestModelErrorsDecorator extends OpinionatedToken<RequestModelErrors> {
  (): ParameterDecorator
}

const token: OpinionatedToken<RequestModelErrors> =
  localToken.opinionated<RequestModelErrors>('RequestModelErrors', {
    multi: false,
    restrictScope: HttpRequestHandlerScope,
  })

const RequestModelErrorsDecoratorToken: RequestModelErrorsDecorator = Object.assign(
  // squash the decorator function and token together so that the exported RequestModelErrors can be used as both the
  // decorator and the injection token
  function RequestModelErrors(): ParameterDecorator {
    return function requestModelErrorsDecorator(
      target: MethodTarget,
      propertyName: string,
      paramIndex: number,
    ): void {
      const paramMeta = getInjectableParamMetadata<any, RequestModelErrorsMetadata>(target, propertyName, paramIndex)
      paramMeta.token = RequestModelErrorsDecoratorToken

      /**
       * This logic is put into a method to ensure that it can be executed after all other params have created their
       * own param metadata - see {@link RequestModelErrors} for more info.
       */
      paramMeta.createRequestModelErrorsProvider = () => requestModelErrorsProvider(target[propertyName])
      // this is replaced by the @HandleModelErrors() decorator
      paramMeta.methodProviders = [{
        provide: RequestModelErrorsDecoratorToken,
        useFactory: function requestModelErrorsFactory(): never {
          throw new AppError(
            '@RequestModelErrors() was used without also adding @HandleModelErrors() to its method',
          )
        },
      }]
    }
  },
  token,
)

function requestModelErrorsProvider(method): Provider<RequestModelErrors> {
  const methodMeta = getInjectableMetadata(method)
  // use the method's param injection targets (expect for RequestModelErrors) as dependencies to ensure all
  // ModelBuilder dependencies have executed and added any errors to the collector before compiling the final errors
  // object from the collector
  const deps = methodMeta.params
    .filter(paramMeta => paramMeta.token !== RequestModelErrorsDecoratorToken)
    .map(paramMeta => paramMeta.token)
  return {
    provide: RequestModelErrorsDecoratorToken,
    useFactory: requestModelErrorsFactory,
    deps: [RequestModelErrorsCollector, ...deps],
  }
}

/**
 * A {@link ParameterDecorator} that injects a {@link RequestModelErrors} containing a summary of all errors encountered
 * when attempting to convert and/or validate body, path, query, or header request values. When using
 * {@link RequestModelErrors} on a parameter, its method must also be decorated with {@link HandleModelErrors}.
 *
 * The reason for this has to do with how decorators are processed in JavaScript. Parameter decorators are invoked
 * starting with the last parameter, and method decorators are invoked after any parameter decorators. Since
 * {@link RequestModelErrors} uses metadata defined by other parameter decorators, there needs to be a way to ensure
 * that the other parameters had already defined their metadata by the time {@link requestModelErrorsProvider} was
 * invoked to create its provider.
 *
 * Using the {@link HandleModelErrors} method decorator to trigger the creations of the {@link RequestModelErrors}
 * provider enables this functionality without adding any restrictions on parameter order, and has the added benefit
 * of creating extra clarity in the user's code - request handler methods that manually handle their own model errors
 * are called out with the extra decorator, where other, undecorated methods would throw when encountering these errors.
 */
export const RequestModelErrors: RequestModelErrorsDecorator = RequestModelErrorsDecoratorToken

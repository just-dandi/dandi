import { Constructor, MethodTarget } from '@dandi/common'
import { InjectionToken, Injector, Provider, Scope } from '@dandi/core'
import { getInjectableParamMetadata, ParamMetadata } from '@dandi/core/internal/util'
import { createHttpRequestHandlerScope, HttpRequestBody, HttpRequestHandlerScope } from '@dandi/http'
import { ModelBuilder, ModelBuilderResult, ModelErrors, ModelBuilderNoThrowOnErrorOptions } from '@dandi/model-builder'

import { ModelBindingError } from './errors'
import { HttpRequestModel } from './http-request-model'
import { localToken } from './local-token'
import { RequestModelErrorsCollector } from './request-model-errors-collector'
import { RequestModelErrors } from './request-model-errors-decorator'
import { RequestParamModelBuilderOptions } from './request-param-decorator'

export interface RequestModel<TModel> extends ParamMetadata<any> {
  model: Constructor<TModel>
}

export const HttpRequestModelBuilderResult: InjectionToken<ModelBuilderResult<any>> =
  localToken.opinionated('HttpRequestModelBuilderResult', {
    multi: false,
    restrictScope: HttpRequestHandlerScope,
  })

export const HttpRequestModelErrors: InjectionToken<ModelErrors> =
  localToken.opinionated<ModelErrors>('HttpRequestModelErrors', {
    multi: false,
    restrictScope: HttpRequestHandlerScope,
  })

function httpRequestModelErrorsFactory(builderResult: ModelBuilderResult<any>): ModelErrors {
  return builderResult.errors
}

export const HttpRequestModelModelErrorsProvider: Provider<ModelErrors> = {
  provide: HttpRequestModelErrors,
  useFactory: httpRequestModelErrorsFactory,
  deps: [HttpRequestModelBuilderResult],
}

function httpRequestModelFactory(injector: Injector, result: ModelBuilderResult<any>): any {

  /**
   * Using the {@link HandleModelErrors} decorator adds the {@link RequestModelErrors} to the injection context.
   * If it is present, then we can be sure that the method looking for {@link HttpRequestModel} is also handling its own
   * model errors, and an error should not be thrown from here.
   */
  if (result?.errors && !injector.canResolve(RequestModelErrors)) {
    throw new ModelBindingError(result.errors)
  }
  return result?.builderValue
}

export const HttpRequestModelProvider: Provider<any> = {
  provide: HttpRequestModel,
  useFactory: httpRequestModelFactory,
  deps: [Injector, HttpRequestModelBuilderResult],
}

/**
 * @internal
 */
export function requestModelBuilderResultProvider(model: Constructor): Provider<ModelBuilderResult<any>> {
  return {
    provide: HttpRequestModelBuilderResult,
    useFactory: (
      source: object,
      builder: ModelBuilder,
      options: ModelBuilderNoThrowOnErrorOptions,
      errorCollector: RequestModelErrorsCollector,
    ) => {
      const result: ModelBuilderResult<any> = builder.constructModel(model, source, options)
      if (result.errors) {
        errorCollector.addBodyErrors(result.errors)
      }
      return result
    },
    deps: [
      HttpRequestBody,
      ModelBuilder,
      RequestParamModelBuilderOptions,
      RequestModelErrorsCollector,
    ],
  }
}

/**
 * @internal
 */
export function requestModelProviders(method: Function, model: Constructor): Provider<any>[] {
  return [
    requestModelBuilderResultProvider(model),
    HttpRequestModelModelErrorsProvider,
    HttpRequestModelProvider,
  ]
}

/**
 * @internal
 */
export function requestModelDecorator<TModel>(
  requestModel: RequestModel<TModel>,
  target: MethodTarget,
  propertyName: string,
  paramIndex: number,
): void {
  Scope(createHttpRequestHandlerScope)(target, propertyName, undefined)
  const paramMeta = getInjectableParamMetadata<any, RequestModel<TModel>>(target, propertyName, paramIndex)
  paramMeta.token = HttpRequestModel
  paramMeta.methodProviders = requestModelProviders(target[propertyName], requestModel.model)
}

export function RequestModel<TModel, TTarget>(model?: Constructor<TModel>): ParameterDecorator {
  return requestModelDecorator.bind(null, { model })
}

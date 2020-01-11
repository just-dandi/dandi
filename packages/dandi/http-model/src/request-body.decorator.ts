import { Constructor, MethodTarget } from '@dandi/common'
import { Provider } from '@dandi/core'
import { getInjectableParamMetadata, ParamMetadata } from '@dandi/core/internal/util'
import { HttpRequestBody, HttpRequestBodySource } from '@dandi/http'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { ModelBindingError } from './errors'
import { RequestParamModelBuilderOptions, RequestParamModelBuilderOptionsProvider } from './request-param.decorator'

export interface RequestBody<TModel, TTarget> extends ParamMetadata<TTarget> {
  model: Constructor<TModel>;
}

export function requestBodyProvider(model: Constructor<any>): Provider<any> {
  return {
    provide: HttpRequestBody,
    useFactory: (source: object, builder: ModelBuilder, options: ModelBuilderOptions) => {
      if (!source) {
        return undefined
      }
      if (!model) {
        return source
      }
      try {
        return builder.constructModel(model, source, options)
      } catch (err) {
        throw new ModelBindingError(err)
      }
    },
    deps: [HttpRequestBodySource, ModelBuilder, RequestParamModelBuilderOptions],
    providers: [RequestParamModelBuilderOptionsProvider],
  }
}

export function requestBodyDecorator<TModel, TTarget>(
  requestBody: RequestBody<TModel, TTarget>,
  target: MethodTarget<TTarget>,
  propertyName: string,
  paramIndex: number,
): void {
  const meta = getInjectableParamMetadata<TTarget, RequestBody<TModel, TTarget>>(target, propertyName, paramIndex)
  meta.token = HttpRequestBody
  meta.providers = [requestBodyProvider(requestBody.model)]
}

export function RequestBody<TModel, TTarget>(model?: Constructor<TModel>): ParameterDecorator {
  return requestBodyDecorator.bind(null, { model })
}

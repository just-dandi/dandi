import { HttpRequestQueryParamMap } from '@dandi/http'
import { ConvertedType } from '@dandi/model-builder'

import { makeRequestParamDecorator } from './request-param.decorator'

export function QueryParam<T>(type?: ConvertedType, name?: string, required = false): ParameterDecorator {
  return makeRequestParamDecorator(HttpRequestQueryParamMap, type || String, name, !required)
}

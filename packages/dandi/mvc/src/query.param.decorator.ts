import { ConvertedType } from '@dandi/model-builder'

import {
  makeRequestParamDecorator,
} from './request.param.decorator'
import { RequestQueryParamMap } from './tokens'

export function QueryParam<T>(type?: ConvertedType, name?: string, required: boolean = false): ParameterDecorator {
  return makeRequestParamDecorator(RequestQueryParamMap, type || String, name, !required)
}

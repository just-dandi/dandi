import { HttpRequestPathParamMap } from '@dandi/http'
import { ConvertedType } from '@dandi/model-builder'

import { makeRequestParamDecorator } from './request-param-decorator'

export function PathParam(type?: ConvertedType, name?: string): any {
  return makeRequestParamDecorator(HttpRequestPathParamMap, type || String, name, false)
}

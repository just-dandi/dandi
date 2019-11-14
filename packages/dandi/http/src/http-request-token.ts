import { InjectionToken } from '@dandi/core'

import { localSymbolToken } from './local-token'
import { ParamMap } from './param-map'

export const HttpRequestBody: InjectionToken<any> = localSymbolToken<any>('HttpRequestBody')
export const HttpRequestPathParamMap: InjectionToken<ParamMap> = localSymbolToken<ParamMap>('HttpRequestPathParamMap')
export const HttpRequestQueryParamMap: InjectionToken<ParamMap> = localSymbolToken<ParamMap>('HttpRequestQueryParamMap')

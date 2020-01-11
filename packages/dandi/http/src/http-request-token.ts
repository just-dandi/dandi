import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local-token'
import { ParamMap } from './param-map'
import { HttpRequestScope } from './http-request-scope'

const options = { restrictScope: HttpRequestScope }

export const HttpRequestBody: InjectionToken<any> = localOpinionatedToken<any>('HttpRequestBody', options)
export const HttpRequestPathParamMap: InjectionToken<ParamMap> = localOpinionatedToken<ParamMap>('HttpRequestPathParamMap', options)
export const HttpRequestQueryParamMap: InjectionToken<ParamMap> = localOpinionatedToken<ParamMap>('HttpRequestQueryParamMap', options)

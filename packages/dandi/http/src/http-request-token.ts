import { HttpRequestScope } from './http-request-scope'
import { localToken } from './local-token'
import { ParamMap } from './param-map'

const options = { restrictScope: HttpRequestScope }

export const HttpRequestBody = localToken.opinionated<any>('HttpRequestBody', options)
export const HttpRequestPathParamMap = localToken.opinionated<ParamMap>('HttpRequestPathParamMap', options)
export const HttpRequestQueryParamMap = localToken.opinionated<ParamMap>('HttpRequestQueryParamMap', options)

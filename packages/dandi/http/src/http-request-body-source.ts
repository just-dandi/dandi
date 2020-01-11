import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'

export const HttpRequestBodySource = localOpinionatedToken<string | object>('HttpRequestBodySource', {
  multi: false,
  restrictScope: HttpRequestScope,
})

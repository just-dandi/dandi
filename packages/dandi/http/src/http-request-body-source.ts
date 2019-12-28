import { localOpinionatedToken } from './local-token'

export const HttpRequestBodySource = localOpinionatedToken<string | object>('HttpRequestBodySource', {
  multi: false,
  singleton: false,
})

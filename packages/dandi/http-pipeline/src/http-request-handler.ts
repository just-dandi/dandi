import { localOpinionatedToken } from './local-token'

export const HttpRequestHandler = localOpinionatedToken<any>('HttpRequestHandler', {
  multi: false,
})
export const HttpRequestHandlerMethod = localOpinionatedToken<string>('HttpRequestHandlerMethod', {
  multi: false,
})

import { localToken } from './local-token'

export const HttpPipelineHandlerResult = localToken.opinionated<any>('HttpPipelineHandlerResult', {
  multi: false,
})

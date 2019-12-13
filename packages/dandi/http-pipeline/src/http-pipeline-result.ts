import { HttpHeaders, HttpStatusCode } from '@dandi/http'

import { localOpinionatedToken } from './local-token'

export interface HttpPipelineResult {
  readonly data?: any
  readonly errors?: Error[]
  readonly headers?: HttpHeaders
  readonly statusCode?: HttpStatusCode
}

export interface HttpPipelineVoidResult extends Omit<HttpPipelineResult, 'data'> {
  readonly void: true
}

export function isHttpPipelineResult(obj: any): obj is HttpPipelineResult {
  return obj && (typeof obj.data !== 'undefined' || obj.void === true || typeof obj.error !== 'undefined')
}

export const HttpPipelineResult = localOpinionatedToken('HttpPipelineResult', {
  multi: false,
})

import { HttpRequestScope, HttpResponseHeaders, HttpStatusCode } from '@dandi/http'

import { localToken } from './local-token'

export interface HttpPipelineDataResult {
  readonly data?: any
  readonly errors?: Error[]
  readonly headers?: HttpResponseHeaders
  readonly statusCode?: HttpStatusCode
}

export interface HttpPipelineVoidResult extends Omit<HttpPipelineDataResult, 'data'> {
  readonly void: true
}

export type HttpPipelineResult = HttpPipelineDataResult | HttpPipelineVoidResult

export function isHttpPipelineResult(obj: any): obj is HttpPipelineResult {
  return obj && (typeof obj.data !== 'undefined' || obj.void === true || typeof obj.errors !== 'undefined')
}

export function isHttpPipelineDataResult(obj: any): obj is HttpPipelineDataResult {
  return obj && obj.data !== null && typeof obj.data !== 'undefined'
}

export function isHttpPipelineVoidResult(obj: any): obj is HttpPipelineVoidResult {
  return obj && obj.void === true
}

export const HttpPipelineResult = localToken.opinionated<HttpPipelineResult>('HttpPipelineResult', {
  multi: false,
  restrictScope: HttpRequestScope,
})

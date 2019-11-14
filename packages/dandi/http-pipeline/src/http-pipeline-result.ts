export interface HttpPipelineResult {
  readonly data: object
  readonly headers?: { [key: string]: string }
}

export interface HttpRequestPipelineVoidResult extends HttpPipelineResult {
  readonly void: true
  readonly data: never
}

export function isHttpPipelineResult(obj: any): obj is HttpPipelineResult {
  return obj && (typeof obj.data !== 'undefined' || obj.void === true)
}

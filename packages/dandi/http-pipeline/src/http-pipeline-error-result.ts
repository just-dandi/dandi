import { HttpPipelineDataResult, isHttpPipelineResult } from './http-pipeline-result'

export interface HttpPipelineErrorResult extends HttpPipelineDataResult {
  readonly errors: Error[]
}

export function isHttpPipelineErrorResult(obj: any): obj is HttpPipelineErrorResult {
  return obj?.errors?.length && isHttpPipelineResult(obj)
}

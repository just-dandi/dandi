import { AppError } from '@dandi/common'

import { HttpPipelineErrorData } from './http-pipeline-error'
import { HttpPipelineDataResult, isHttpPipelineResult } from './http-pipeline-result'

export interface HttpPipelineErrorResult extends HttpPipelineDataResult {
  readonly errors: Error[]
}

export function isHttpPipelineErrorResult(obj: any): obj is HttpPipelineErrorResult {
  return obj?.errors?.length && isHttpPipelineResult(obj)
}

export class HttpPipelineErrorRendererDataFactory {

  constructor(
    private readonly result: HttpPipelineErrorResult,
  ) {}

  public getErrorRendererData(debugMode: boolean): HttpPipelineErrorData {
    return {
      statusCode: this.result.statusCode,
      message: this.result.errors[0].message,
      errors: this.result.errors.map(error => ({
        message: error.message,
        innerMessage: debugMode ? (error as any).innerMessage : undefined,
        stack: debugMode ? AppError.stack(error) : undefined,
      })),
    }
  }
}

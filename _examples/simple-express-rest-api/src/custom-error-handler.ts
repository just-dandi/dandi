import { Injectable } from '@dandi/core'
import { HttpPipelineErrorResult, HttpPipelineErrorResultHandler } from '@dandi/http-pipeline'

@Injectable(HttpPipelineErrorResultHandler)
export class CustomErrorHandler implements HttpPipelineErrorResultHandler {
  public handleError(result: HttpPipelineErrorResult): Promise<HttpPipelineErrorResult> {
    console.log('CustomErrorHandler.handleError')
    return Promise.resolve(result)
  }
}

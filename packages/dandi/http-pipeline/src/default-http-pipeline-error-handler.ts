import { Injectable } from '@dandi/core'
import { HttpStatusCode, isRequestError } from '@dandi/http'

import { HttpPipelineErrorResult } from './http-pipeline-error-result'
import { HttpPipelineErrorResultHandler } from './http-pipeline-error-result-handler'

@Injectable(HttpPipelineErrorResultHandler)
export class DefaultHttpPipelineErrorHandler implements HttpPipelineErrorResultHandler {

  public async handleError(result: HttpPipelineErrorResult): Promise<HttpPipelineErrorResult> {
    const [error] = result.errors
    return {
      statusCode: isRequestError(error) ? error.statusCode : HttpStatusCode.internalServerError,
      headers: result.headers,
      errors: result.errors,
      data: result.data,
    }
  }

}

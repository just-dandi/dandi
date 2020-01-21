import { Inject, Injectable, Logger, RestrictScope } from '@dandi/core'
import { HttpRequest, HttpRequestScope } from '@dandi/http'
import {
  HttpPipelineTerminator,
  HttpPipelineRendererResult,
  HttpResponsePipelineTerminator,
} from '@dandi/http-pipeline'
import { APIGatewayProxyResult } from 'aws-lambda'

import { LambdaHttpResponse } from './lambda-http-response'

@Injectable(HttpPipelineTerminator, RestrictScope(HttpRequestScope))
export class LambdaTerminator extends HttpResponsePipelineTerminator<APIGatewayProxyResult> {

  protected response: LambdaHttpResponse

  constructor(
    @Inject(HttpRequest) request: HttpRequest,
    @Inject(LambdaHttpResponse) response: LambdaHttpResponse,
    @Inject(Logger) logger: Logger,
  ) {
    super(request, response, logger)
  }

  public async terminateResponse(renderResult: HttpPipelineRendererResult): Promise<APIGatewayProxyResult> {
    super.terminateResponse(renderResult)
    return {
      statusCode: this.response.statusCode,
      headers: this.response.headers,
      body: this.response.body,
    }
  }
}

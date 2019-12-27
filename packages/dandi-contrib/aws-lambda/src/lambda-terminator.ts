import { Injectable } from '@dandi/core'
import { HttpPipelineTerminator, HttpPipelineRendererResult } from '@dandi/http-pipeline'
import { APIGatewayProxyResult } from 'aws-lambda'

@Injectable(HttpPipelineTerminator)
export class LambdaTerminator implements HttpPipelineTerminator {
  public async terminateResponse(result: HttpPipelineRendererResult): Promise<APIGatewayProxyResult> {
    return {
      statusCode: result.statusCode,
      headers: result.headers,
      body: result.renderedBody || '',
    }
  }
}

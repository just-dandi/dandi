import { localOpinionatedToken } from './local-token'
import { HttpPipelineRendererResult } from './rendering/http-pipeline-renderer'

/**
 * A service that handles writing the final response headers, body, statusCode, etc, and terminates the response.
 */
export interface HttpPipelineTerminator {
  terminateResponse(result: HttpPipelineRendererResult): Promise<any>
}

export const HttpPipelineTerminator = localOpinionatedToken('HttpPipelineTerminator', {
  multi: false,
})

import { HttpPipelineResult } from './http-pipeline-result'
import { localToken } from './local-token'

export interface HttpPipelineResultTransformer {
  transform(result: HttpPipelineResult): Promise<HttpPipelineResult>
}

export const HttpPipelineResultTransformer = localToken.opinionated<HttpPipelineResultTransformer>(
  'HttpPipelineResultTransformer',
  {
    multi: true,
  },
)

import { HttpPipelineResult } from './http-pipeline-result'
import { localOpinionatedToken } from './local-token'

export interface HttpPipelineResultTransformer {
  transform(result: HttpPipelineResult): Promise<HttpPipelineResult>
}

export const HttpPipelineResultTransformer = localOpinionatedToken<HttpPipelineResultTransformer>(
  'HttpPipelineResultTransformer',
  {
    multi: true,
  },
)

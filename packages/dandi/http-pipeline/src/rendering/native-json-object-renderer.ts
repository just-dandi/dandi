import { Inject } from '@dandi/core'
import { MimeType } from '@dandi/http'

import { HttpPipelineConfig } from '../http-pipeline-config'
import { HttpPipelineErrorRendererDataFactory, isHttpPipelineErrorResult } from '../http-pipeline-error-result'
import { HttpPipelineResult, isHttpPipelineDataResult } from '../http-pipeline-result'

import { HttpPipelineRendererBase } from './http-pipeline-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeType.applicationJson)
export class NativeJsonObjectRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeType.applicationJson

  constructor(
    @Inject(HttpPipelineConfig) private config: HttpPipelineConfig,
  ) {
    super()
  }

  protected renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): string | Promise<string> {
    if (isHttpPipelineErrorResult(pipelineResult)) {
      const dataFactory = pipelineResult.data instanceof HttpPipelineErrorRendererDataFactory ?
        pipelineResult.data :
        new HttpPipelineErrorRendererDataFactory(pipelineResult)
      return JSON.stringify(dataFactory.getErrorRendererData(this.config.debugMode))
    }

    if (isHttpPipelineDataResult(pipelineResult)) {
      return JSON.stringify(pipelineResult.data)
    }
    return ''
  }

}

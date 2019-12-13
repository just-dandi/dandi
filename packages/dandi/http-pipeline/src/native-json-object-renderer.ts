import { MimeTypes } from '@dandi/http'

import { HttpPipelineResult } from './http-pipeline-result'
import { HttpPipelineRendererBase } from './http-pipeline-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeTypes.applicationJson)
export class NativeJsonObjectRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeTypes.applicationJson

  constructor() {
    super()
  }

  protected renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): string | Promise<string> {
    return JSON.stringify(pipelineResult.data)
  }

}

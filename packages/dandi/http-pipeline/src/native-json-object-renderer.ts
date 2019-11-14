import { MimeTypes } from '@dandi/http'

import { HttpPipelineResult } from './http-pipeline-result'
import { HttpResponseRendererBase } from './http-response-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeTypes.applicationJson)
export class NativeJsonObjectRenderer extends HttpResponseRendererBase {

  protected readonly defaultContentType: string = MimeTypes.applicationJson

  constructor() {
    super()
  }

  protected renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): string | Promise<string> {
    return JSON.stringify(pipelineResult.data)
  }

}

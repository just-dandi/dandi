import { MimeTypes } from '@dandi/http'

import { HttpPipelineResult } from './http-pipeline-result'
import { HttpPipelineRendererBase } from './http-pipeline-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeTypes.textPlain)
export class PlainTextObjectRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textPlain

  constructor() {
    super()
  }

  protected renderPipelineResult(contentType: string, pipelineResult: HttpPipelineResult): string | Promise<string> {
    return (pipelineResult.data === undefined || pipelineResult.data === null) ? '' : pipelineResult.data.toString()
  }

}

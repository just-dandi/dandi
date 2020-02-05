import { MimeType } from '@dandi/http'

import { HttpPipelineDataResult, isHttpPipelineDataResult } from '../http-pipeline-result'

import { HttpPipelineRendererBase } from './http-pipeline-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeType.textPlain)
export class PlainTextObjectRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeType.textPlain

  constructor() {
    super()
  }

  protected renderPipelineResult(contentType: string, pipelineResult: HttpPipelineDataResult): string | Promise<string> {
    if (isHttpPipelineDataResult(pipelineResult)) {
      return pipelineResult.data.toString()
    }
    return ''
  }

}

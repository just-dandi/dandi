import { Inject } from '@dandi/core'
import { MimeType } from '@dandi/http'

import { HttpPipelineConfig } from '../http-pipeline-config'
import { HttpPipelineErrorData } from '../http-pipeline-error'
import { HttpPipelineErrorRendererDataFactory, isHttpPipelineErrorResult } from '../http-pipeline-error-result'
import { HttpPipelineDataResult, isHttpPipelineDataResult } from '../http-pipeline-result'

import { HttpPipelineRendererBase } from './http-pipeline-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeType.textPlain, MimeType.any)
export class PlainTextObjectRenderer extends HttpPipelineRendererBase {
  protected readonly defaultContentType: string = MimeType.textPlain

  constructor(@Inject(HttpPipelineConfig) private config: HttpPipelineConfig) {
    super()
  }

  protected renderPipelineResult(contentType: string, pipelineResult: HttpPipelineDataResult): string {
    if (isHttpPipelineErrorResult(pipelineResult)) {
      const dataFactory =
        pipelineResult.data instanceof HttpPipelineErrorRendererDataFactory
          ? pipelineResult.data
          : new HttpPipelineErrorRendererDataFactory(pipelineResult)
      return this.renderError(dataFactory.getErrorRendererData(this.config.debugMode))
    }

    if (isHttpPipelineDataResult(pipelineResult)) {
      return pipelineResult.data.toString()
    }

    return ''
  }

  public renderError(data: HttpPipelineErrorData): string {
    return data.errors
      .reduce(
        (result, entry) => {
          result.push('--------------------------------', '', entry.message)
          if (entry.innerMessage) {
            result.push('', entry.innerMessage)
          }
          if (entry.stack) {
            result.push('', entry.stack)
          }
          return result
        },
        [`Error ${data.statusCode}`],
      )
      .join('\n')
  }
}

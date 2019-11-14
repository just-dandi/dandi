import { Constructor } from '@dandi/common'
import { isRenderableMimeType, MimeTypeInfo } from '@dandi/http'

import { HttpPipelineResult } from './http-pipeline-result'
import { HttpResponseRenderer, HttpResponseRendererResult } from './http-response-renderer'
import { getRendererMetadata } from './renderer-decorator'

export abstract class HttpResponseRendererBase implements HttpResponseRenderer {

  public readonly renderableTypes: MimeTypeInfo[]
  protected abstract readonly defaultContentType: string

  protected constructor() {
    this.renderableTypes = getRendererMetadata(this.constructor as Constructor<HttpResponseRenderer>).acceptTypes
  }

  public async render(acceptTypes: MimeTypeInfo[], pipelineResult: HttpPipelineResult): Promise<HttpResponseRendererResult> {
    const contentType = this.determineContentType(acceptTypes)
    return {
      contentType,
      renderedOutput: await this.renderPipelineResult(contentType, pipelineResult),
    }
  }

  protected abstract renderPipelineResult(contentType: string, value: any): string | Promise<string>

  protected determineContentType(acceptTypes: MimeTypeInfo[]): string {
    const renderedType = acceptTypes.find(acceptType => !!this.renderableTypes.find(renderableType => isRenderableMimeType(acceptType, renderableType)))
    if (!renderedType) {
      return this.defaultContentType
    }
    return renderedType.fullType
  }

}

import { Constructor } from '@dandi/common'
import { mimeTypesAreCompatible, MimeTypeInfo } from '@dandi/http'

import { HttpPipelineResult } from '../http-pipeline-result'

import { HttpPipelineRenderer, HttpPipelineRendererResult } from './http-pipeline-renderer'
import { getRendererMetadata } from './renderer-decorator'

export abstract class HttpPipelineRendererBase implements HttpPipelineRenderer {

  public readonly renderableTypes: MimeTypeInfo[]
  protected abstract readonly defaultContentType: string

  protected constructor() {
    this.renderableTypes = getRendererMetadata(this.constructor as Constructor<HttpPipelineRenderer>).acceptTypes
  }

  public async render(acceptTypes: MimeTypeInfo[], pipelineResult: HttpPipelineResult): Promise<HttpPipelineRendererResult> {
    const contentType = this.determineContentType(acceptTypes)
    return {
      statusCode: pipelineResult.statusCode,
      headers: pipelineResult.headers,
      contentType,
      renderedBody: await this.renderPipelineResult(contentType, pipelineResult),
    }
  }

  protected abstract renderPipelineResult(contentType: string, value: HttpPipelineResult): string | Promise<string>

  protected determineContentType(acceptTypes: MimeTypeInfo[]): string {
    const renderedType = acceptTypes.find(acceptType => !!this.renderableTypes.find(renderableType => mimeTypesAreCompatible(acceptType, renderableType)))
    if (!renderedType) {
      return this.defaultContentType
    }
    return renderedType.fullType
  }

}

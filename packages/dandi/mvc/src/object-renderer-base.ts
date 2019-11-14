import { Constructor } from '@dandi/common'
import { isRenderableMimeType, MimeTypeInfo } from '@dandi/http'

import { ObjectRenderer, ObjectRendererResult } from './object-renderer'
import { getRendererMetadata } from './renderer-decorator'
import { ControllerResult } from './controller.result'

export abstract class ObjectRendererBase implements ObjectRenderer {

  public readonly renderableTypes: MimeTypeInfo[]
  protected abstract readonly defaultContentType: string

  protected constructor() {
    this.renderableTypes = getRendererMetadata(this.constructor as Constructor<ObjectRenderer>).acceptTypes
  }

  public async render(acceptTypes: MimeTypeInfo[], controllerResult: ControllerResult): Promise<ObjectRendererResult> {
    const contentType = this.determineContentType(acceptTypes)
    return {
      contentType,
      renderedOutput: await this.renderControllerResult(contentType, controllerResult),
    }
  }

  protected abstract renderControllerResult(contentType: string, value: any): string | Promise<string>

  protected determineContentType(acceptTypes: MimeTypeInfo[]): string {
    const renderedType = acceptTypes.find(acceptType => !!this.renderableTypes.find(renderableType => isRenderableMimeType(acceptType, renderableType)))
    if (!renderedType) {
      return this.defaultContentType
    }
    return renderedType.fullType
  }

}

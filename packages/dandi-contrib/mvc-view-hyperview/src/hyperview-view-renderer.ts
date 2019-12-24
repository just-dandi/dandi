import { Inject } from '@dandi/core'
import {
  ControllerResult,
  MimeTypeInfo,
  MimeTypes,
  ObjectRenderer,
  ObjectRendererResult,
  parseMimeTypes,
  Renderer,
} from '@dandi/mvc'
import { MvcViewRenderer } from '@dandi/mvc-view'

import { HyperviewMimeTypes } from './hyperview-mime-types'

const TEXT_HTML_TYPE_INFO = parseMimeTypes(MimeTypes.textHtml)
const HYPERVIEW_TYPE_INFO = parseMimeTypes(HyperviewMimeTypes.hyperviewMarkup, MimeTypes.applicationXml)

@Renderer(HyperviewMimeTypes.hyperviewMarkup, MimeTypes.applicationXml)
export class HyperviewViewRenderer implements ObjectRenderer {

  public readonly defaultContentType = HyperviewMimeTypes.hyperviewMarkup
  public readonly renderableTypes = HYPERVIEW_TYPE_INFO

  constructor(@Inject(MvcViewRenderer) private viewRenderer: MvcViewRenderer) {}

  public async render(acceptTypes: MimeTypeInfo[], controllerResult: ControllerResult): Promise<ObjectRendererResult> {
    // reuse the existing text/html view renderer - this allows view engine implementations already configured for
    // html to be reused to render hxml
    const result = await this.viewRenderer.render(TEXT_HTML_TYPE_INFO, controllerResult)
    result.contentType = this.defaultContentType
    return result
  }

}

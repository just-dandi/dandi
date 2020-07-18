import { Inject, Injectable, RestrictScope } from '@dandi/core'
import { HttpRequestScope, MimeTypeInfo, MimeType, parseMimeTypes } from '@dandi/http'
import { HttpPipelineRenderer, HttpPipelineRendererResult, HttpPipelineResult, Renderer } from '@dandi/http-pipeline'
import { MvcViewRenderer } from '@dandi/mvc-view'

import { HyperviewMimeTypes } from './hyperview-mime-types'

const TEXT_HTML_TYPE_INFO = parseMimeTypes(MimeType.textHtml)
const HYPERVIEW_TYPE_INFO = parseMimeTypes(HyperviewMimeTypes.hyperviewMarkup, MimeType.applicationXml)

@Injectable(RestrictScope(HttpRequestScope))
@Renderer(HyperviewMimeTypes.hyperviewMarkup, MimeType.applicationXml)
export class HyperviewViewRenderer implements HttpPipelineRenderer {
  public readonly defaultContentType = HyperviewMimeTypes.hyperviewMarkup
  public readonly renderableTypes = HYPERVIEW_TYPE_INFO

  constructor(@Inject(MvcViewRenderer) private viewRenderer: MvcViewRenderer) {}

  public async render(
    acceptTypes: MimeTypeInfo[],
    pipelineResult: HttpPipelineResult,
  ): Promise<HttpPipelineRendererResult> {
    // reuse the existing text/html view renderer - this allows view engine implementations already configured for
    // html to be reused to render hxml
    const result = await this.viewRenderer.render(TEXT_HTML_TYPE_INFO, pipelineResult)
    result.contentType = this.defaultContentType
    return result
  }
}

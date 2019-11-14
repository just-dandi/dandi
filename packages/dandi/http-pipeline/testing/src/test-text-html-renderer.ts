import { MimeTypes } from '@dandi/http'
import { HttpResponseRendererBase, Renderer } from '@dandi/http-pipeline'

import { stub } from 'sinon'

@Renderer(MimeTypes.textHtml)
export class TestTextHtmlRenderer extends HttpResponseRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textHtml

  constructor() {
    super()

    stub(this as any, 'renderPipelineResult')
  }

  protected renderPipelineResult(): string | Promise<string> {
    return undefined
  }

}

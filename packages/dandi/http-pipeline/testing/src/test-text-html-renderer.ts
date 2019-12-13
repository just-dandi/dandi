import { MimeTypes } from '@dandi/http'
import { HttpPipelineRendererBase, Renderer } from '@dandi/http-pipeline'

import { stub } from 'sinon'

@Renderer(MimeTypes.textHtml)
export class TestTextHtmlRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textHtml

  constructor() {
    super()

    stub(this as any, 'renderPipelineResult')
  }

  protected renderPipelineResult(): string | Promise<string> {
    return undefined
  }

}

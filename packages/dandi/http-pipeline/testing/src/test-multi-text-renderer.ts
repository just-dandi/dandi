import { MimeTypes } from '@dandi/http'
import { HttpResponseRendererBase, Renderer } from '@dandi/http-pipeline'

import { stub } from 'sinon'

@Renderer(MimeTypes.textPlain, MimeTypes.textHtml)
export class TestMultiTextRenderer extends HttpResponseRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textPlain

  constructor() {
    super()

    stub(this as any, 'renderPipelineResult')
  }

  protected renderPipelineResult(): string | Promise<string> {
    return undefined
  }

}

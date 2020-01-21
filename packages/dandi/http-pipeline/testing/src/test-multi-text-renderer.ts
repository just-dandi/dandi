import { MimeType } from '@dandi/http'
import { HttpPipelineRendererBase, Renderer } from '@dandi/http-pipeline'

import { stub } from 'sinon'

@Renderer(MimeType.textPlain, MimeType.textHtml)
export class TestMultiTextRenderer extends HttpPipelineRendererBase {

  protected readonly defaultContentType: string = MimeType.textPlain

  constructor() {
    super()

    stub(this as any, 'renderPipelineResult')
  }

  protected renderPipelineResult(): string | Promise<string> {
    return undefined
  }

}

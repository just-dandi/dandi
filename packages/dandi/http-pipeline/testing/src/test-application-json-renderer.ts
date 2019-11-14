import { MimeTypes } from '@dandi/http'
import { HttpResponseRendererBase, Renderer } from '@dandi/http-pipeline'

import { stub } from 'sinon'

@Renderer(MimeTypes.applicationJson)
export class TestApplicationJsonRenderer extends HttpResponseRendererBase {

  protected readonly defaultContentType: string = MimeTypes.applicationJson

  constructor() {
    super()

    stub(this as any, 'renderPipelineResult')
  }

  protected renderPipelineResult(): string | Promise<string> {
    return undefined
  }

}

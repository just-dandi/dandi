import { MimeType } from '@dandi/http'
import { HttpPipelineRendererBase, Renderer } from '@dandi/http-pipeline'

import { stub } from 'sinon'

@Renderer(MimeType.applicationJson)
export class TestApplicationJsonRenderer extends HttpPipelineRendererBase {
  protected readonly defaultContentType: string = MimeType.applicationJson

  constructor() {
    super()

    stub(this as any, 'renderPipelineResult')
  }

  protected renderPipelineResult(): string | Promise<string> {
    return undefined
  }
}

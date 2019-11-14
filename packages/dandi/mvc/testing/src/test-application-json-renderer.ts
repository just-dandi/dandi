import { MimeTypes } from '@dandi/http'
import { ObjectRendererBase, Renderer } from '@dandi/mvc'

import { stub } from 'sinon'

@Renderer(MimeTypes.applicationJson)
export class TestApplicationJsonRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.applicationJson

  constructor() {
    super()

    stub(this as any, 'renderControllerResult')
  }

  protected renderControllerResult(): string | Promise<string> {
    return undefined
  }

}

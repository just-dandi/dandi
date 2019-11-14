import { MimeTypes } from '@dandi/http'
import { ObjectRendererBase, Renderer } from '@dandi/mvc'

import { stub } from 'sinon'

@Renderer(MimeTypes.textHtml)
export class TestTextHtmlRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textHtml

  constructor() {
    super()

    stub(this as any, 'renderControllerResult')
  }

  protected renderControllerResult(): string | Promise<string> {
    return undefined
  }

}

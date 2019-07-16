import { MimeTypes, ObjectRendererBase, Renderer } from '@dandi/mvc'
import { stub } from 'sinon'

@Renderer(MimeTypes.textPlain)
export class TestTextPlainRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textPlain

  constructor() {
    super()

    stub(this as any, 'renderControllerResult')
  }

  protected renderControllerResult(): string | Promise<string> {
    return undefined
  }

}

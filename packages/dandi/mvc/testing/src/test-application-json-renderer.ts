import { MimeTypes, ObjectRendererBase, Renderer } from '@dandi/mvc'
import { stub } from 'sinon'

@Renderer(MimeTypes.applicationJson)
export class TestApplicationJsonRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.applicationJson

  constructor() {
    super()

    stub(this as any, 'renderControllerResult')
  }

  protected renderControllerResult(contentType: string, value: any): string | Promise<string> {
    return undefined
  }

}

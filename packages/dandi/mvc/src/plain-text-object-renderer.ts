import { MimeTypes } from '@dandi/http'

import { ControllerResult } from './controller.result'
import { ObjectRendererBase } from './object-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeTypes.textPlain)
export class PlainTextObjectRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.textPlain

  constructor() {
    super()
  }

  protected renderControllerResult(contentType: string, controllerResult: ControllerResult): string | Promise<string> {
    return (controllerResult.data === undefined || controllerResult.data === null) ? '' : controllerResult.data.toString()
  }

}

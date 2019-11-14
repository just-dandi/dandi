import { MimeTypes } from '@dandi/http'

import { ControllerResult } from './controller.result'
import { ObjectRendererBase } from './object-renderer-base'
import { Renderer } from './renderer-decorator'

@Renderer(MimeTypes.applicationJson)
export class NativeJsonObjectRenderer extends ObjectRendererBase {

  protected readonly defaultContentType: string = MimeTypes.applicationJson

  constructor() {
    super()
  }

  protected renderControllerResult(contentType: string, controllerResult: ControllerResult): string | Promise<string> {
    return JSON.stringify(controllerResult.data)
  }

}

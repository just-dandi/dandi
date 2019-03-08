import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'

import { ControllerResult } from './controller.result'
import { localOpinionatedToken } from './local.token'
import { MimeTypeInfo } from './mime-type-info'

export interface ObjectRendererResult {
  renderedOutput: string
  contentType: string
}
export interface ObjectRenderer {
  readonly renderableTypes: MimeTypeInfo[]
  render(acceptTypes: MimeTypeInfo[], controllerResult: ControllerResult): ObjectRendererResult | Promise<ObjectRendererResult>
}
export const ObjectRenderer: InjectionToken<ObjectRenderer> = localOpinionatedToken('ObjectRenderer', {
  multi: true,
  singleton: false,
})

export class DefaultObjectRenderer {
  public static use(rendererType: Constructor<ObjectRenderer>): [Constructor<ObjectRenderer>, Provider<DefaultObjectRenderer>] {
    return [
      rendererType,
      {
        provide: DefaultObjectRenderer,
        useValue: rendererType,
      },
    ]
  }
}

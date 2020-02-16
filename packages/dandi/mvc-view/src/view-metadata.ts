import { ControllerMethodMetadata } from '@dandi/mvc'

import { RenderOptions } from './render-options'

export interface ViewMetadata {
  name: string
  path?: string
  context: string
  options?: RenderOptions
}

export interface ControllerViewMethodMetadata extends ControllerMethodMetadata {
  view?: ViewMetadata
}

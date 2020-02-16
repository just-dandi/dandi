import { dirname } from 'path'

import { MethodTarget, callsite } from '@dandi/common'
import { getControllerMetadata } from '@dandi/mvc'

import { ControllerViewMethodMetadata, ViewFilter } from './view-metadata'

export interface ViewDecoratorConfig {
  name?: string
  options?: any
  filter?: ViewFilter[]
}

export function View(options?: ViewDecoratorConfig): MethodDecorator
export function View(name: string, ...filter: ViewFilter[]): MethodDecorator
export function View(nameOrConfig?: string | ViewDecoratorConfig, ...filter: ViewFilter[]): MethodDecorator {
  let name: string
  let options: any
  if (typeof nameOrConfig === 'string') {
    name = nameOrConfig
    options = undefined
  } else {
    name = nameOrConfig?.name
    options = nameOrConfig?.options
    filter = nameOrConfig?.filter
  }
  const context = dirname(callsite()[1].getFileName())
  return function viewDecorator(target: MethodTarget<any>, propertyKey: string) {
    const meta = getControllerMetadata(target.constructor)

    let controllerMethodMetadata: ControllerViewMethodMetadata = meta.routeMap.get(propertyKey)
    if (!controllerMethodMetadata) {
      controllerMethodMetadata = {}
      meta.routeMap.set(propertyKey, controllerMethodMetadata)
    }
    if (!controllerMethodMetadata.views) {
      controllerMethodMetadata.views = []
    }
    controllerMethodMetadata.views.push({
      name,
      context,
      options: { viewEngineOptions: options },
      filter,
    })
  }
}

import { dirname } from 'path'

import { MethodTarget, callsite } from '@dandi/common'
import { getControllerMetadata } from '@dandi/mvc'

import { ControllerViewMethodMetadata } from './view-metadata'

export function View(name?: string, options?: any): MethodDecorator {
  const context = dirname(callsite()[1].getFileName())
  return function viewDecorator(target: MethodTarget<any>, propertyKey: string) {
    const meta = getControllerMetadata(target.constructor)

    let controllerMethodMetadata: ControllerViewMethodMetadata = meta.routeMap.get(propertyKey)
    if (!controllerMethodMetadata) {
      controllerMethodMetadata = {}
      meta.routeMap.set(propertyKey, controllerMethodMetadata)
    }
    controllerMethodMetadata.view = {
      name,
      context,
      options: { viewEngineOptions: options },
    }
  }
}
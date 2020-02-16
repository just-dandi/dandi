import { Constructor } from '@dandi/common'

import { getResourceMetadata, resourceMetaKey } from './resource.metadata'

export interface ResourceDecorator {
  (): ClassDecorator
  isResource(obj: any): boolean
}

const Resource: ResourceDecorator = function Resource() {
  return function(target: Constructor<any>) {
    getResourceMetadata(target)
  }
} as ResourceDecorator
Resource.isResource = function isResource(obj: any): boolean {
  if (!obj) {
    return false
  }
  const target = typeof obj === 'function' ? obj : obj.constructor
  const meta = Reflect.get(target, resourceMetaKey(target))
  return !!(meta && meta.resource === target)
}

export { Resource }

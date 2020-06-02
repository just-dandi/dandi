import { Constructor } from '@dandi/common'

import { getResourceMetadata, RESOURCE_META_KEY } from './resource.metadata'

export interface ResourceDecorator {
  (): ClassDecorator
  isResource(obj: any): boolean
}

const Resource: ResourceDecorator = function Resource() {
  return function(target: Constructor) {
    getResourceMetadata(target)
  }
} as ResourceDecorator
Resource.isResource = function isResource(obj: any): boolean {
  if (!obj) {
    return false
  }
  const target = typeof obj === 'function' ? obj : obj.constructor
  const meta = Reflect.get(target, RESOURCE_META_KEY)
  return !!(meta && meta.resource === target)
}

export { Resource }

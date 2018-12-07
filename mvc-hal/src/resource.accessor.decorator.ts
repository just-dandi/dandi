import { Constructor, MethodTarget, getMetadata } from '@dandi/common'
import { ResourceAccessorMetadata, getResourceMetadata, resourceMetaKey } from '@dandi/hal'

import { globalSymbol } from './global.symbol'

export const RESOURCE_ACCESSOR_META_KEY = globalSymbol('meta:ResourceAccessor')

export function getAccessorMetadata(target: MethodTarget<any>, propertyKey: string): ResourceAccessorMetadata {
  return getMetadata<ResourceAccessorMetadata>(
    RESOURCE_ACCESSOR_META_KEY,
    () => ({
      controller: target.constructor,
      method: propertyKey,
      paramMap: {},
    }),
    target[propertyKey],
  )
}

export function resourceAccessor(resource: Constructor<any>, target: MethodTarget<any>, propertyKey: string): void {
  const meta = getResourceMetadata(resource)
  meta.getAccessor = getAccessorMetadata(target, propertyKey)
  if (resource) {
    meta.getAccessor.resource = resource
  }

  // also set a reference to the metadata on the method itself so it can be retrieved and updated by resourceIdDecorator
  getMetadata(resourceMetaKey(resource), () => meta, target[propertyKey])
}

export function ResourceAccessor(resource: Constructor<any>): MethodDecorator {
  return resourceAccessor.bind(null, resource)
}

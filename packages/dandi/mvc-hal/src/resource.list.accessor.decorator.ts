import { Constructor, MethodTarget, getMetadata } from '@dandi/common'
import { getResourceMetadata, RESOURCE_META_KEY } from '@dandi/hal'

import { getAccessorMetadata } from './resource.accessor.decorator'

export function resourceListAccessor(resource: Constructor, target: MethodTarget<any>, propertyKey: string): void {
  const meta = getResourceMetadata(resource)
  meta.listAccessor = getAccessorMetadata(target, propertyKey)
  if (resource) {
    meta.listAccessor.resource = resource
  }

  // also set a reference to the metadata on the method itself so it can be retrieved and updated by resourceIdDecorator
  getMetadata(RESOURCE_META_KEY, () => meta, target[propertyKey])
}

export function ResourceListAccessor(resource: Constructor): MethodDecorator {
  return resourceListAccessor.bind(null, resource)
}

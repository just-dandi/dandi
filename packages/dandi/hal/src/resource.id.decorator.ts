import { Constructor, MethodTarget } from '@dandi/common'

import { getResourceMetadata } from './resource.metadata'

export function resourceIdDecorator<T>(
  resourceType: Constructor<T>,
  rel: string,
  target: MethodTarget<any>,
  propertyKey: string,
): void {
  // when called on a model property, set id property
  const resourceMeta = getResourceMetadata(target.constructor)
  if (resourceType) {
    if (!rel) {
      throw new Error('rel is required when specifying a resourceType')
    }
    if (!resourceMeta.relations[rel]) {
      resourceMeta.relations[rel] = { resource: resourceType }
    }
    resourceMeta.relations[rel].idProperty = propertyKey
  } else {
    resourceMeta.idProperty = propertyKey
  }
}

export function ResourceId<T>(resourceType?: Constructor<T>, rel?: string): PropertyDecorator {
  return resourceIdDecorator.bind(null, resourceType, rel)
}

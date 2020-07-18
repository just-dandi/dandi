import { Constructor } from '@dandi/common'

import { ResourceMetadata, getResourceMetadata, RESOURCE_META_KEY } from './resource.metadata'

export function Relations(forModel: Constructor): any {
  // use any return type because Constructor<any> is no assignable to TFunction?
  return function (target: Constructor): void {
    // super simple hack: use an object reference to link the target's relation metadata to the decorated class
    const existingMeta = Reflect.get(target, RESOURCE_META_KEY) as ResourceMetadata
    const meta = getResourceMetadata(forModel)
    if (existingMeta) {
      // member decorators run before class decorators, so we need to copy over any existing relation metadata
      Object.keys(existingMeta.relations).forEach((rel) => {
        if (existingMeta.relations[rel] && existingMeta.relations[rel].resource) {
          meta.relations[rel] = Object.assign(meta.relations[rel] || {}, existingMeta.relations[rel])
        }
      })
    }
    Reflect.set(target, RESOURCE_META_KEY, meta)
  }
}

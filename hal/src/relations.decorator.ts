import { Constructor } from '@dandi/common';
import { resourceMetaKey, ResourceMetadata, getResourceMetadata } from './resource.metadata';

export function Relations(forModel: Constructor<any>) {
  return function(target: Constructor<any>) {
    // super simple hack: use an object reference to link the target's relation metadata to the decorated class
    const key = resourceMetaKey(target);
    const existingMeta = Reflect.get(target, key) as ResourceMetadata;
    const meta = getResourceMetadata(forModel);
    if (existingMeta) {
      // apparently member decorators run before class decorators, so we need to copy over any existing relation metadata
      Object.keys(existingMeta.relations).forEach((rel) => {
        if (existingMeta.relations[rel] && existingMeta.relations[rel].resource) {
          meta.relations[rel] = Object.assign(meta.relations[rel], existingMeta.relations[rel]);
        }
      });
    }
    Reflect.set(target, key, meta);
  };
}

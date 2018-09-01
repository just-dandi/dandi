import { Constructor, getMetadata } from '@dandi/common';
import { MethodTarget } from '@dandi/core';

import { globalSymbol } from './global.symbol';
import { getResourceMetadata, RESOURCE_META_KEY, ResourceAccessor } from './resource.metadata';

export const RESOURCE_ACCESSOR_META_KEY = globalSymbol('meta:ResourceAccessor');

export function getAccessorMetadata(target: MethodTarget<any>, propertyKey: string) {
  return getMetadata<ResourceAccessor>(
    RESOURCE_ACCESSOR_META_KEY,
    () => ({
      controller: target.constructor,
      method: propertyKey,
      paramMap: {},
    }),
    target[propertyKey],
  );
}

export function resourceAccessor(resource: Constructor<any>, target: MethodTarget<any>, propertyKey: string) {
  const meta = getResourceMetadata(resource);
  meta.getAccessor = getAccessorMetadata(target, propertyKey);
  meta.getAccessor.resource = resource;

  // also set a reference to the metadata on the method itself so it can be retrieved and updated by resourceIdDecorator
  getMetadata(RESOURCE_META_KEY, () => meta, target[propertyKey]);
}

export function ResourceAccessor(resource: Constructor<any>) {
  return resourceAccessor.bind(null, resource);
}

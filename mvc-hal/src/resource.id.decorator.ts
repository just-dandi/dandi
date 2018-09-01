import { Constructor } from '@dandi/common';
import { getInjectableParamMetadata, MethodTarget } from '@dandi/core';

import { getAccessorMetadata } from './resource.accessor.decorator';
import { getResourceMetadata } from './resource.metadata';

export class InheritedResourceType {}

export function resourceIdDecorator<T>(
  resourceType: Constructor<T>,
  rel: string,
  target: MethodTarget<any>,
  propertyKey: string,
  paramIndex: number,
) {
  if (paramIndex === undefined) {
    // when called on a model property, set id property
    const resourceMeta = getResourceMetadata(target.constructor);
    if (resourceType) {
      if (!rel) {
        throw new Error('rel is required when specifying a resourceType');
      }
      if (!resourceMeta.relations[rel]) {
        resourceMeta.relations[rel] = { resource: resourceType };
      }
      resourceMeta.relations[rel].idProperty = propertyKey;
    } else {
      resourceMeta.idProperty = propertyKey;
    }
  } else {
    // when called on a controller method parameter, add the entry to the corresponding accessor's param map
    const accessorMeta = getAccessorMetadata(target, propertyKey);
    // load the ParamMetadata to get the name of the parameter
    const paramMeta = getInjectableParamMetadata(target, propertyKey, paramIndex);
    if (!accessorMeta.paramMap[paramMeta.name]) {
      accessorMeta.paramMap[paramMeta.name] = resourceType || InheritedResourceType;
    }
  }
}

export function ResourceId<T>(resourceType?: Constructor<T>, rel?: string) {
  return resourceIdDecorator.bind(null, resourceType, rel);
}

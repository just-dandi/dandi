import { Constructor, MethodTarget } from '@dandi/common'
import { getInjectableParamMetadata } from '@dandi/core'

import { getAccessorMetadata } from './resource.accessor.decorator'

export class InheritedResourceType {}

export function accessorResourceIdDecorator<T>(
  resourceType: Constructor<T>,
  rel: string,
  target: MethodTarget<any>,
  propertyKey: string,
  paramIndex: number,
): void {
  // when called on a controller method parameter, add the entry to the corresponding accessor's param map
  const accessorMeta = getAccessorMetadata(target, propertyKey)
  // load the ParamMetadata to get the name of the parameter
  const paramMeta = getInjectableParamMetadata(target, propertyKey, paramIndex)
  if (!accessorMeta.paramMap[paramMeta.name]) {
    accessorMeta.paramMap[paramMeta.name] = resourceType || InheritedResourceType
  }
}

export function AccessorResourceId<T>(resourceType?: Constructor<T>, rel?: string): ParameterDecorator {
  return accessorResourceIdDecorator.bind(null, resourceType, rel)
}

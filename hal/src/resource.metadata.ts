import { Constructor, getMetadata, isConstructor } from '@dandi/common';

import { globalSymbol } from './global.symbol';

export function resourceMetaKey(target: Constructor<any>): symbol {
  return globalSymbol(`meta:Resource:${target.name}`);
}

export interface ResourceAccessorMetadata {
  resource?: Constructor<any>;
  controller: Constructor<any>;
  method: string;
  paramMap: { [paramIndex: number]: Constructor<any> };
}

export interface ResourceMetadata {
  resource: Constructor<any>;
  idProperty: string;
  getAccessor?: ResourceAccessorMetadata;
  listAccessor?: ResourceAccessorMetadata;
  relations: { [rel: string]: ResourceRelationMetadata };
  parent?: ResourceMetadata;
}

export interface ResourceRelationMetadata {
  resource: Constructor<any>;
  list?: boolean;
  idProperty?: string;
}

export function getResourceMetadata(obj: any): ResourceMetadata {
  const target = isConstructor(obj) ? obj : (obj.constructor as Constructor<any>);
  return getMetadata<ResourceMetadata>(
    resourceMetaKey(target),
    () => {
      const meta: ResourceMetadata = { resource: target, relations: {}, idProperty: null };
      const targetParent = Object.getPrototypeOf(target);
      if (targetParent !== Object && targetParent.name) {
        meta.parent = getResourceMetadata(targetParent);
      }
      return meta;
    },
    target,
  );
}

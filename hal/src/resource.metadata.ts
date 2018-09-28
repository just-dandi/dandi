import { Constructor, getMetadata, isConstructor, MethodTarget } from '@dandi/common';

import { globalSymbol } from './global.symbol';

export const RESOURCE_META_KEY = globalSymbol('meta:Resource');

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
}

export interface ResourceRelationMetadata {
  resource: Constructor<any>;
  list?: boolean;
  idProperty?: string;
}

export function getResourceMetadata(target: Constructor<any> | MethodTarget<any>): ResourceMetadata {
  const ctr = isConstructor(target) ? target : target.constructor as Constructor<any>;
  return getMetadata<ResourceMetadata>(
    RESOURCE_META_KEY,
    () => {
      const meta = { resource: ctr, relations: {}, idProperty: null };
      const targetParent = Object.getPrototypeOf(target);
      if (targetParent !== Object && targetParent.name) {
        Object.setPrototypeOf(meta, getResourceMetadata(targetParent));
      }
      return meta;
    },
    target,
  );
}

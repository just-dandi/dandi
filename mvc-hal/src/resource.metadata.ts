import { Constructor, getMetadata } from '@dandi/common';
import { MethodTarget } from '@dandi/core';

import { globalSymbol } from './global.symbol';

export const RESOURCE_META_KEY = globalSymbol('meta:Resource');

export interface ResourceAccessor {
  resource?: Constructor<any>;
  controller: Constructor<any>;
  method: string;
  paramMap: { [paramIndex: number]: Constructor<any> };
}

export interface ResourceMetadata {
  resource: Constructor<any>;
  idProperty: string;
  getAccessor?: ResourceAccessor;
  listAccessor?: ResourceAccessor;
  relations: { [rel: string]: ResourceRelationMetadata };
}

export interface ResourceRelationMetadata {
  resource: Constructor<any>;
  list?: boolean;
  idProperty?: string;
}

export function getResourceMetadata(target: Constructor<any> | MethodTarget<any>): ResourceMetadata {
  return getMetadata<ResourceMetadata>(
    RESOURCE_META_KEY,
    () => {
      const meta = { resource: target as Constructor<any>, relations: {}, idProperty: null };
      const targetParent = Object.getPrototypeOf(target);
      if (targetParent !== Object && targetParent.name) {
        Object.setPrototypeOf(meta, getResourceMetadata(targetParent));
      }
      return meta;
    },
    target,
  );
}

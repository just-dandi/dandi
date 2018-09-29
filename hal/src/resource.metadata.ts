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
  idProperty?: string;
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

export class CompositeResourceMetadata implements ResourceMetadata {
  public resource: Constructor<any>;
  public idProperty: string;
  public getAccessor: ResourceAccessorMetadata;
  public listAccessor: ResourceAccessorMetadata;
  public relations: { [rel: string]: ResourceRelationMetadata };

  public constructor(source: ResourceMetadata) {
    this.resource = source.resource;
    this.idProperty = this.getPropertyValue(source, 'idProperty');
    this.getAccessor = this.getPropertyValue(source, 'getAccessor');
    this.listAccessor = this.getPropertyValue(source, 'listAccessor');
    this.relations = this.mergePropertyValues(source, 'relations', {});
  }

  private getPropertyValue(source: ResourceMetadata, prop: keyof ResourceMetadata): any {
    if (source[prop]) {
      return source[prop];
    }
    if (source.parent) {
      return this.getPropertyValue(source.parent, prop);
    }
    return undefined;
  }

  private mergePropertyValues(source: ResourceMetadata, prop: keyof ResourceMetadata, value: any): any {
    if (source.parent) {
      this.mergePropertyValues(source.parent, prop, value);
    }
    return Object.assign(value, source[prop], value);
  }
}

export function getResourceMetadata(obj: any): ResourceMetadata {
  const target = isConstructor(obj) ? obj : (obj.constructor as Constructor<any>);
  return getMetadata<ResourceMetadata>(
    resourceMetaKey(target),
    () => {
      const meta: ResourceMetadata = { resource: target, relations: {} };
      const targetParent = Object.getPrototypeOf(target);
      if (targetParent !== Object && targetParent.name) {
        meta.parent = getResourceMetadata(targetParent);
      }
      return new CompositeResourceMetadata(meta);
    },
    target,
  );
}

import { Constructor } from '@dandi/common'

export type SourceAccessorFn = <TSource, TMember>(source: TSource) => TMember

export type MemberSourceAccessor = string | SourceAccessorFn

export interface MemberMetadata {
  type?: Constructor<any>;
  keyType?: Constructor<any>;
  valueType?: Constructor<any>;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  format?: string;
  oneOf?: Array<Constructor<any>>;
  json?: boolean;
  sourceAccessor?: MemberSourceAccessor;
}

export interface ModelMetadata {
  [propertyName: string]: MemberMetadata;
}

const protoKeys = new Map<Function, Map<Symbol, any>>()

export function getModelMetadata(target: Function): ModelMetadata {
  let protoKey = protoKeys.get(target)
  if (!protoKey) {
    protoKey = new Map<Symbol, any>()
    protoKeys.set(target, protoKey)
  }
  const classKey = Symbol.for(target.name)
  let classTarget = protoKey.get(classKey)
  if (!classTarget) {
    const superClass = Object.getPrototypeOf(target)
    const usePrototypeTarget = !!target.prototype && !!superClass.name
    classTarget = Object.create(usePrototypeTarget ? getModelMetadata(superClass) : null)
    protoKey.set(classKey, classTarget)
  }
  return classTarget
}

/**
 * Used walk the prototype hierarchy of a {@see ModelMetadata} object and gather a list of all inherited properties
 */
export function getAllKeys(obj: ModelMetadata): string[] {
  if (obj === null) {
    return []
  }
  return Object.keys(obj).concat(getAllKeys(Object.getPrototypeOf(obj)))
}

export function getMemberMetadata(target: any, propertyName: string, paramIndex?: number): MemberMetadata {
  const modelMetadata = getModelMetadata(target)
  const key = typeof paramIndex === 'number' ? `${propertyName}__${paramIndex}` : propertyName
  if (!modelMetadata[key]) {
    modelMetadata[key] = {} as any
  }
  return modelMetadata[key]
}

import { Constructor } from './constructor'

export interface Descriptor<T> {
  configurable?: boolean
  enumerable?: boolean
  value?: T
  writable?: boolean

  get?(): T

  set?(v: T): void
}

const DESCRIPTOR_KEYS: (keyof Descriptor<unknown>)[] = [
  'configurable',
  'enumerable',
  'value',
  'writable',
  'get',
  'set',
]

export function hasOwnProperty<TProp extends string | symbol | number>(
  obj: unknown,
  ...prop: TProp[]
): obj is Record<TProp, unknown> {
  return prop.every((p) => obj?.hasOwnProperty(p))
}

export function hasAnyOwnProperty<TProp extends string | symbol | number>(
  obj: unknown,
  ...prop: TProp[]
): obj is Record<TProp, unknown> {
  return prop.some((p) => obj?.hasOwnProperty(p))
}

export type TypeGuard<T> = (obj: unknown) => obj is T

export interface ConstructorCheck<T> {
  type: Constructor<T>
}

export function isConstructorCheck<T>(obj: unknown): obj is ConstructorCheck<T> {
  return hasOwnProperty(obj, 'type') && typeof obj.type === 'function'
}

export interface TypeGuardCheck<T> {
  isType: TypeGuard<T>
}

export function isTypeGuardCheck<T>(obj: unknown): obj is TypeGuardCheck<T> {
  return hasOwnProperty(obj, 'check') && typeof obj.check === 'function'
}

export interface LiteralCheck<T> {
  value: T
}

export function isLiteralCheck(obj: unknown): obj is LiteralCheck<any> {
  return hasOwnProperty(obj, 'value') && typeof obj.value !== 'undefined'
}

export interface ExistsCheck {
  exists: true
}

export type TypeCheck<T> = ConstructorCheck<T> | TypeGuardCheck<T> | LiteralCheck<T> | ExistsCheck

export type PropDefs<TProps extends object> = {
  [TKey in keyof TProps]: TypeCheck<TProps[TKey]>
}

function checkType<T>(obj: unknown, check: TypeCheck<T>): obj is T {
  if (isConstructorCheck(check)) {
    if ((check.type as any) === String) {
      return typeof obj === 'string'
    }
    if ((check.type as any) === Number) {
      return typeof obj === 'number'
    }
    if ((check.type as any) === Boolean) {
      return typeof obj === 'boolean'
    }
    if ((check.type as any) === Function) {
      return typeof obj === 'function'
    }

    return obj instanceof check.type
  }
  if (isTypeGuardCheck(check)) {
    return check.isType(obj)
  }
  if (isLiteralCheck(check)) {
    return obj === check.value
  }
  return typeof obj !== 'undefined'
}

export function hasOwnProperties<TProps extends object>(obj: unknown, propDefs: PropDefs<TProps>): obj is TProps {
  if (!hasOwnProperty(obj, ...Object.keys(propDefs))) {
    return false
  }
  const defs: [string, TypeCheck<any>][] = Object.entries(propDefs)
  return (
    typeof obj !== 'undefined' &&
    defs.every(([name, check]) => {
      const value = obj[name]
      return checkType(value, check)
    })
  )
}

export function isDescriptor<T>(obj: unknown): obj is Descriptor<T> {
  if (!obj) {
    return false
  }

  if (Object.getOwnPropertyNames(obj).some((prop) => (DESCRIPTOR_KEYS as string[]).indexOf(prop) < 0)) {
    return false
  }

  if (obj.hasOwnProperty('value')) {
    return true
  }

  return (
    (hasOwnProperty(obj, 'get') && typeof obj.get === 'function') ||
    (hasOwnProperty(obj, 'set') && typeof obj.set === 'function')
  )
}

// https://stackoverflow.com/a/49579497/2596
// export type ReadonlyDescriptorMap<TInit, TProps = TInit>
// {
//   [TProp in keyof TProps]
// }

export type DescriptorMap<TInit, TProps = TInit> = {
  [TProp in keyof Omit<TProps, keyof TInit>]: Descriptor<TProps[TProp]>
} &
  ThisType<TInit & TProps>

export type ObjectInitFn = (...args: unknown[]) => unknown
export type ObjectInit<T> = Partial<T> | ObjectInitFn
export type ObjectProps<TInit, TProps> = DescriptorMap<
  TInit,
  TInit extends ObjectInitFn ? TProps : Omit<TProps, keyof TInit>
>

export function isObjectInit<T, TObjectInit extends ObjectInit<T>>(obj: unknown): obj is TObjectInit {
  return typeof obj === 'function' || !isObjectProps(obj)
}

export function isObjectProps<T, TInit extends ObjectInit<T>>(obj: unknown): obj is ObjectProps<T, TInit> {
  return typeof obj === 'object' && Object.entries(obj).every(([, value]) => isDescriptor(value))
}

export function defineObject<T>(properties: DescriptorMap<T, T> & ThisType<T>): T
export function defineObject<TInit, TProps>(obj: TInit, properties: DescriptorMap<TInit, TProps>): TInit & TProps
export function defineObject<TInit, TProps, T extends TInit & TProps>(
  objOrProperties: TInit | TProps,
  properties?: DescriptorMap<TInit, TProps>,
): T {
  if (isObjectProps<T, TInit>(objOrProperties)) {
    return Object.defineProperties({}, objOrProperties) as T
  }
  return Object.defineProperties(objOrProperties, properties) as T
}

export function createObject<TPrototype extends object, TProps extends object>(
  obj: TPrototype,
  props: DescriptorMap<TPrototype, TProps>,
): TPrototype & TProps {
  return defineObject({ ...obj }, props)
}

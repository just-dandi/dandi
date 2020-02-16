export interface Constructor<T = any> extends Function {
  new (...args: any[]): T
}

export type PrimitiveConstructor<T extends boolean | number | string> =
  T extends boolean ? BooleanConstructor :
    T extends number ? NumberConstructor :
      T extends string ? StringConstructor :
        never

export function isConstructor<T>(obj: any): obj is Constructor<T> {
  if (typeof obj !== 'function') {
    return false
  }
  return !!obj.prototype
}

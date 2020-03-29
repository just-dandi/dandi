export interface Constructor<T = any> extends Function {
  new (...args: any[]): T
}

export type PrimitiveConstructor<T extends boolean | number | string> =
  T extends boolean ? BooleanConstructor :
    T extends number ? NumberConstructor :
      T extends string ? StringConstructor :
        never

// const IS_CONSTRUCTOR_PATTERN = /^class\s+\w+\s*\{/
// const IS_CONSTRUCTOR = globalSymbol('IS_CONSTRUCTOR')

export function isConstructor<T>(obj: any): obj is Constructor<T> {
  if (typeof obj !== 'function') {
    return false
  }
  return !!obj.prototype
  // const cachedResult = Reflect.get(obj, IS_CONSTRUCTOR)
  // if (typeof cachedResult !== 'undefined') {
  //   return cachedResult
  // }
  // const isConstructor = IS_CONSTRUCTOR_PATTERN.test(obj.name)
  // Reflect.set(obj, IS_CONSTRUCTOR, isConstructor)
  // return isConstructor
}

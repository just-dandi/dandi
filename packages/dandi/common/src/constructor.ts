/**
 * Represents a class constructor function.
 */
export interface Constructor<T = any> extends Function {
  new (...args: any[]): T
}

/**
 * Returns `true` if the specified object is a class constructor function; otherwise, `false`.
 * @param obj
 */
export function isConstructor<T>(obj: any): obj is Constructor<T> {
  if (typeof obj !== 'function') {
    return false
  }
  return !!obj.prototype
}

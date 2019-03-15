/**
 * Returns `true` if `obj` is a `Promise<T>`, or if it has a `then` property that is a function; otherwise, `false`.
 * @param obj The object to check
 */
export function isPromise<T>(obj: any | Promise<T>): obj is Promise<T> {
  return obj instanceof Promise || (obj && typeof obj.then === 'function')
}

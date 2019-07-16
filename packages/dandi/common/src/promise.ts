export function isPromise<T>(obj: any | Promise<T>): obj is Promise<T> {
  return obj instanceof Promise || (obj && typeof obj.then === 'function')
}

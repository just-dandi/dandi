export function cloneObject<T>(obj: T): T {
  if (!obj) {
    return obj
  }
  const type = typeof obj
  if (type === 'object' && Array.isArray(obj)) {
    return obj.slice(0).map(cloneObject) as unknown as T
  }
  if (type !== 'object') {
    return obj
  }
  const clone = {} as T
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      clone[prop] = cloneObject(obj[prop])
    }
  }
  return clone
}

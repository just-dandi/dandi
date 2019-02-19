export function cloneObject<T extends any>(obj: T): T {
  if (!obj) {
    return obj
  }
  const type = typeof obj
  if (type === 'object' && Array.isArray(obj)) {
    return obj.slice(0).map(cloneObject)
  }
  if (type !== 'object') {
    return obj
  }
  const clone = {} as T
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      clone[prop] = cloneObject(obj[prop])
    }
  }
  return clone
}

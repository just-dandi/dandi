export interface Jsonable {
  toJSON(): any
}

export function isJsonable(obj: any): obj is Jsonable {
  if (!obj) {
    return false
  }
  return typeof obj.toJSON === 'function'
}

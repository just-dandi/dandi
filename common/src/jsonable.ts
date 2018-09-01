export interface Jsonable {
  toJsonObject(): any;
}

export function isJsonable(obj: any): obj is Jsonable {
  if (!obj) {
    return false;
  }
  return typeof obj.toJsonObject === 'function';
}

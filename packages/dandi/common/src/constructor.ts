export interface Constructor<T = unknown> extends Function {
  readonly prototype: T

  new (...args: unknown[]): T
}

export interface MultiConstructor<T = unknown> extends Constructor<T> {
  multi: true
}

export interface SingleConstructor<T = unknown> extends Constructor<T> {
  multi: false
}

export type PrimitiveConstructor<T extends boolean | number | string> = T extends boolean
  ? BooleanConstructor
  : T extends number
  ? NumberConstructor
  : T extends string
  ? StringConstructor
  : never

export function isConstructor<T>(obj: unknown): obj is Constructor<T> {
  if (typeof obj !== 'function') {
    return false
  }
  return !!obj.prototype
}

import { Constructor } from './constructor'

export type ClassMembers<T> = { [TProp in keyof T]?: T[TProp] }

export type MethodTarget<T> = ClassMembers<T> & {
  constructor: Constructor<T>
}

export function methodTarget<T>(target: Constructor<T>): MethodTarget<T> {
  return (target.prototype as unknown) as MethodTarget<T>
}

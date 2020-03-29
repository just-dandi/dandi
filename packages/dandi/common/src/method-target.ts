import { Constructor } from './constructor'

export type ClassMethods<T> = { [TProp in keyof T]?: T[TProp] }

export type MethodTarget<T = any> = ClassMethods<T> & {
  constructor: Constructor<T>
}

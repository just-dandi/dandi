import { Constructor } from './constructor'

export type ClassMethods<T> = { [TProp in keyof T]?: T[TProp] }

export type MethodTarget<T> = ClassMethods<T> & {
  constructor: Constructor<T>;
}

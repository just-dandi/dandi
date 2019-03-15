import { Constructor } from './constructor'

/**
 * @ignore
 */
export type ClassMethods<T> = { [P in keyof T]?: T[P] }

/**
 * @ignore
 */
export type MethodTarget<T> = ClassMethods<T> & {
  constructor: Constructor<T>
}

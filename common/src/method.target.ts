import { Constructor } from './constructor';

export type ClassMethods<T> = { [P in keyof T]?: T[P] };

export type MethodTarget<T> = ClassMethods<T> & {
  constructor: Constructor<T>;
};

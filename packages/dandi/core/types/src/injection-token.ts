import { AppError, Constructor } from '@dandi/common'

import { SymbolTokenBase } from './symbol-token'

export interface MappedInjectionToken<TKey, TService> {
  provide: InjectionToken<TService>
  key: TKey
}

export type MappedInjectionTokenFactory<T> = (<TKey, TService>(key: TKey) => MappedInjectionToken<TKey, TService>)

export type ClassDecoratorToken<T> = (...args: any[]) => ClassDecorator

export type InjectionToken<T> =
  | SymbolTokenBase<T>
  | Constructor<T>
  | MappedInjectionToken<any, T>
  | MappedInjectionTokenFactory<T>
  | ClassDecoratorToken<T>


export class InjectionTokenTypeError extends AppError {
  constructor(public readonly target: any) {
    super('The specified target is not a valid Constructor or SymbolToken')
  }
}

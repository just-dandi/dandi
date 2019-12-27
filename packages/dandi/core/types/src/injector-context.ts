import { localToken } from'../../src/local-token'

import { InjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'
import { Registerable } from './registerable'

export const InjectorContext = localToken.opinionated('InjectorContext', {
  multi: false,
})

export type InjectorContextFindResult<T> = Provider<T> | Set<Provider<T>>

export interface InjectorContext {
  readonly parent: InjectorContext
  readonly scope: InjectionScope

  addSingleton<T>(provider: Provider<T>, value: T): T
  find<T>(token: InjectionToken<T>): InjectorContextFindResult<T>
  getSingleton<T>(provider: Provider<T>): T
  createChild(scope: InjectionScope, ...providers: Registerable[]): InjectorContext
}

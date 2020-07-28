import { ResolverContext } from '@dandi/core'

import { localToken } from '../../src/local-token'

import { InjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'
import { Registerable } from './registerable'

export const InjectorContext = localToken.opinionated<InjectorContext>('InjectorContext', {
  multi: false,
})

export interface InjectorContext {
  readonly parent: InjectorContext
  readonly scope: InjectionScope

  addInstance<T>(provider: Provider<T>, value: T): T
  find<T>(token: InjectionToken<T>): ResolverContext<T>
  getInstance<T>(provider: Provider<T>): T
  createChild(scope: InjectionScope, ...providers: Registerable[]): InjectorContext
  findInstanceContext(matchContext: InjectorContext, scope?: InjectionScope): InjectorContext

  getInstanceRequest<T>(provider: Provider<T>): Promise<T>
  setInstanceRequest<T>(provider: Provider<T>, value: Promise<T>): Promise<T>
}

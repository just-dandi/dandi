import { localToken } from '../../src/local-token'

import { InjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'

export const ResolverContext = localToken.opinionated<ResolverContext>('ResolverContext', {
  multi: false,
})

export interface ResolverContext<TTarget = unknown> {
  readonly injectionScope: InjectionScope
  readonly match: Provider<TTarget> | Set<Provider<TTarget>>
  readonly result: TTarget | TTarget[]
  readonly target: InjectionToken<TTarget>

  addInstance(provider: Provider<TTarget>, value: TTarget): TTarget
  getInstance(provider: Provider<TTarget>): TTarget
  resolveValue(result: TTarget | TTarget[]): TTarget | TTarget[]

  getInstanceRequest(provider: Provider<TTarget>): Promise<TTarget>
  setInstanceRequest(provider: Provider<TTarget>, value: Promise<TTarget>): Promise<TTarget>
}

import { localToken } from '../../src/local-token'

import { InjectionResult } from './injection-result'
import { InjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { Provider } from './provider'

export const ResolverContext = localToken.opinionated('ResolverContext', {
  multi: false,
})

export interface ResolverContext<TTarget = unknown> {
  readonly injectionScope: InjectionScope
  readonly match: Provider<TTarget> | Set<Provider<TTarget>>
  readonly result: InjectionResult<TTarget>
  readonly target: InjectionToken<TTarget>

  addInstance(provider: Provider<TTarget>, value: TTarget): TTarget
  getInstance(provider: Provider<TTarget>): TTarget
  resolveValue(result: TTarget | TTarget[]): InjectionResult<TTarget>

  getInstanceRequest(provider: Provider<TTarget>): Promise<TTarget>
  setInstanceRequest(provider: Provider<TTarget>, value: Promise<TTarget>): Promise<TTarget>
}

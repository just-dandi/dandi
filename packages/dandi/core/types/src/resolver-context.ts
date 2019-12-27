import { localToken } from'../../src/local-token'

import { InjectionResult } from './injection-result'
import { InjectionScope } from './injection-scope'
import { InjectionToken } from './injection-token'
import { InjectorContextFindResult } from './injector-context'
import { Provider } from './provider'

export const ResolverContext = localToken.opinionated('ResolverContext', {
  multi: false,
})

export interface ResolverContext<TTarget = unknown> {
  readonly injectionScope: InjectionScope
  readonly match: InjectorContextFindResult<TTarget>
  readonly result: InjectionResult<TTarget>
  readonly target: InjectionToken<TTarget>

  addInstance(obj: TTarget): TTarget
  addSingleton(provider: Provider<TTarget>, value: TTarget): TTarget
  resolveValue(result: TTarget | TTarget[]): InjectionResult<TTarget>
  getSingleton(provider: Provider<TTarget>): TTarget
}

import { InjectionScope, InjectionToken, Provider, ResolverContext } from '@dandi/core/types'

import { DandiInjectorContext } from './dandi-injector-context'

export class DandiResolverContext<TTarget = unknown> implements ResolverContext<TTarget> {
  public get result(): TTarget | TTarget[] {
    return this._result
  }

  public readonly injectionScope: InjectionScope

  private _result: TTarget | TTarget[]

  constructor(
    public readonly target: InjectionToken<TTarget>,
    public readonly match: Provider<TTarget> | Set<Provider<TTarget>>,
    public readonly matchContext: DandiInjectorContext,
    public readonly injectorContext: DandiInjectorContext,
  ) {
    this.injectionScope = injectorContext?.scope
  }

  public resolveValue(result: TTarget | TTarget[]): TTarget | TTarget[] {
    this._result = result
    return this._result
  }

  public getInstance(provider: Provider<TTarget>): TTarget {
    return this.injectorContext.getInstance(provider)
  }

  public addInstance(provider: Provider<TTarget>, value: TTarget): TTarget {
    return this.injectorContext.addInstance(provider, value)
  }

  public getInstanceRequest<T>(provider: Provider<T>): Promise<T> {
    return this.injectorContext.getInstanceRequest(provider)
  }

  public setInstanceRequest<T>(provider: Provider<T>, value: Promise<T>): Promise<T> {
    return this.injectorContext.setInstanceRequest(provider, value)
  }
}

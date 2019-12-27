import { CUSTOM_INSPECTOR, Disposable } from '@dandi/common'
import { Provider } from '@dandi/core'

import { InjectorContext } from './injector-context'
import { getInjectionScope, getInjectionScopeName } from './injection-scope-util'
import { InjectionResult } from './injection-result'
import { InjectionScope } from './injection-scope'
import { InjectionToken, getTokenString } from './injection-token'
import { RepositoryEntry } from './repository'

export class ResolverContext<TTarget = unknown> {

  public get injectionScope(): InjectionScope {
    return getInjectionScope(this.match as any) || this.injectorContext.scope
  }

  public get match(): RepositoryEntry<TTarget> {
    if (!this._match) {
      this._match = this.injectorContext.find(this.target)
    }
    return this._match
  }

  public get result(): InjectionResult<TTarget> {
    return this._result
  }

  private _match: RepositoryEntry<TTarget>
  private _result: InjectionResult<TTarget>

  private readonly instances: any[] = []

  constructor(
    public readonly target: InjectionToken<TTarget>,
    private readonly injectorContext: InjectorContext,
  ) {

    if (!injectorContext) {
      throw new Error('parentInjectorContext must be specified')
    }

  }

  public addInstance(obj: TTarget): TTarget {
    this.instances.push(obj)
    return obj
  }

  public resolveValue(result: TTarget | TTarget[]): InjectionResult<TTarget> {
    this._result = new InjectionResult<TTarget>(this, result)
    return this._result
  }

  public getSingleton(provider: Provider<TTarget>): TTarget {
    return this.injectorContext.getSingleton(provider)
  }

  public addSingleton(provider: Provider<TTarget>, value: TTarget): TTarget {
    return this.injectorContext.addSingleton(provider, value)
  }

  public async dispose(reason: string): Promise<void> {
    await Promise.all(this.instances.map((instance) => {
      if (Disposable.isDisposable(instance) && !Disposable.isDisposed(instance)) {
        return instance.dispose(`Disposing ResolverContext for ${this.getCustomInspectorString()}: ${reason}`)
      }
    }))
    this.instances.length = 0
    Disposable.remapDisposed(this, reason)
  }

  public [CUSTOM_INSPECTOR](): string {
    const parts = [this.getCustomInspectorString()]
    if (this.injectorContext) {
      parts.push(this.injectorContext[CUSTOM_INSPECTOR]())
    }
    return parts.reverse().join(' -> ')
  }

  protected getCustomInspectorString(): string {

    const thisContext = getInjectionScope(this.match as any) || this.injectorContext.scope
    if (!thisContext && !this.target) {
      // this shouldn't really happen
      return '???'
    }

    return getInjectionScopeName(thisContext) || getTokenString(this.target)
  }

}

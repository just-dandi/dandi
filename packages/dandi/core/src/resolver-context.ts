import { Disposable } from '@dandi/common'
import {
  getInjectionContext,
  getInjectionContextName,
  getTokenString,
  InjectionContext,
  InjectionResult,
  InjectionToken,
  Provider,
  RepositoryEntry,
} from '@dandi/core'

import { InjectorContext } from './injector-context'

export class ResolverContext<T> extends InjectorContext {

  public get injectionContext(): InjectionContext {
    return getInjectionContext(this.match as any) || super.injectionContext
  }

  public get match(): RepositoryEntry<T> {
    if (!this._match) {
      this._match = this.find(this.target)
    }
    return this._match
  }

  public get result(): InjectionResult<T> {
    return this._result
  }

  private _match: RepositoryEntry<T>
  private _result: InjectionResult<T>

  private readonly instances: any[] = []

  constructor(
    public readonly target: InjectionToken<T>,
    parentInjectorContext: InjectorContext,
    injectionContext: InjectionContext,
    providers: Provider<any>[] = [],
  ) {
    super(parentInjectorContext, injectionContext, providers)

    if (!parentInjectorContext) {
      throw new Error('parentInjectorContext must be specified')
    }

  }

  public addInstance(obj: T): T {
    this.instances.push(obj)
    return obj
  }

  public resolveValue(result: T | T[]): InjectionResult<T> {
    this._result = new InjectionResult<T>(this, result)
    return this._result
  }

  public async dispose(reason: string): Promise<void> {
    await Promise.all(this.instances.map((instance) => {
      if (Disposable.isDisposable(instance)) {
        return instance.dispose(`Disposing ResolverContext: ${reason}`)
      }
    }))
    this.instances.length = 0
    return super.dispose(reason)
  }

  protected getCustomInspectorString(): string {

    const thisContext = this.context || getInjectionContext(this.match as any)
    if (!thisContext && !this.target && !this.parent) {
      // this shouldn't really happen for ResolverContexts
      return '???'
    }

    return getInjectionContextName(thisContext) || getTokenString(this.target)
  }

}

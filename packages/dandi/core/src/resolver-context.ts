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

/**
 * An {@see InjectorContext} used for resolving specific {@see Provider}s during dependency injection.
 */
export class ResolverContext<T> extends InjectorContext {

  /**
   * Gets an {@see InjectionContext} representing the matched {@see RepositoryEntry}.
   */
  public get injectionContext(): InjectionContext {
    return getInjectionContext(this.match as any) || super.injectionContext
  }

  /**
   * Gets the matching {@see RepositoryEntry} for the instance's {@see target}.
   */
  public get match(): RepositoryEntry<T> {
    if (!this._match) {
      this._match = this.find(this.target)
    }
    return this._match
  }

  /**
   * Gets the {@see InjectionResult} for the instance's {@see match}, if it has been resolved.
   */
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

  /**
   * Registers an object instance that was generated for the {@see ResolverContext}.
   * @param obj
   */
  public addInstance(obj: T): T {
    this.instances.push(obj)
    return obj
  }

  /**
   * Resolves the {@see ResolverContext} with the specified injection `result`.
   * @param result
   */
  public resolveValue(result: T | T[]): InjectionResult<T> {
    this._result = new InjectionResult<T>(this, result)
    return this._result
  }

  /**
   * Disposes all instances registered with {@see addInstance}, then follows the same behavior as [[InjectorContext.dispose]].
   * @param reason A brief description of why the object is being disposed
   */
  public async dispose(reason: string): Promise<void> {
    await Promise.all(this.instances.map((instance) => {
      if (Disposable.isDisposable(instance) && !Disposable.isDisposed(instance)) {
        return instance.dispose(`Disposing ResolverContext: ${reason}`)
      }
    }))
    this.instances.length = 0
    return super.dispose(reason)
  }

  /**
   * @internal
   * Gets a string representing the {@see ResolverContext} in an dependency injection stack
   */
  protected getCustomInspectorString(): string {

    const thisContext = this.context || getInjectionContext(this.match as any)
    if (!thisContext && !this.target && !this.parent) {
      // this shouldn't really happen for ResolverContexts
      return '???'
    }

    return getInjectionContextName(thisContext) || getTokenString(this.target)
  }

}

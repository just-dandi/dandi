import { Disposable } from '@dandi/common'

/**
 * An object containing the value resulting from calling [[Injector.inject]].
 */
export class InjectionResult<T> implements Disposable {
  public constructor(private readonly injectorContext: Disposable, private readonly _value: T | T[]) {}

  /**
   * Gets the injected object
   */
  public get value(): T | T[] {
    return this._value
  }

  /**
   * Gets the injected object typed as a single `T`
   */
  public get singleValue(): T {
    return this.value as T
  }

  /**
   * Gets the injected object typed as an `Array<T>`
   */
  public get arrayValue(): T[] {
    return this.value as T[]
  }

  /**
   * Disposes of the {@see InjectorContext} used to resolve and generate the injected object instance
   * @param reason A brief description of why the object is being disposed
   */
  public async dispose(reason: string): Promise<void> {
    await this.injectorContext.dispose(`Disposing ResolveResult: ${reason}`)
  }
}

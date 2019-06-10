import { AppError } from './app-error'
import { DISABLE_REMAP } from './disposable-flags'
import { globalSymbol } from './global.symbol'
import { isPromise } from './promise'

/**
 * A function that can be called to dispose resources owned by an instance
 */
export type DisposeFn = (reason: string) => void | Promise<void>

/**
 * @ignore
 */
export const DISPOSED = globalSymbol('Disposable.DISPOSED')

/**
 * @ignore
 */
export const DISPOSED_REASON = globalSymbol('Disposable.DISPOSED_REASON')

/**
 * ## `Disposable` Interface
 * Allows classes to define behavior for cleaning up resources like IO streams, database connections,
 * as well as `Observable` and other event subscriptions.
 *
 * When used with [[@dandi/core]]'s dependency injection, {@see Disposable} instances are automatically disposed at the
 * end of their lifecycle.
 *
 * When implementing, it is recommended to call [[Disposable.remapDisposed]] on the instance to ensure that it is
 * correctly marked as `disposed`, and will throw errors if your code attempts to use it after disposal.
 *
 * ```typescript
 * class MyService implements Disposable {
 *
 *   constructor(private dbClient: DbClient) {}
 *
 *   public dispose(reason: string): void {
 *     this.dbClient.release()
 *     Disposable.remapDisposed(this, reason)
 *   }
 *
 * }
 * ```
 *
 * ## `Disposable` Static Class
 * Provides utility functions for working with {@see Disposable} object instances.
 */
export interface Disposable {

  /**
   * Disposes of any resources controlled by the instance
   * @param reason A brief description of why the object is being disposed
   */
  dispose(reason: string): void | Promise<void>
}

/**
 * Options for customizing the behavior of [[Disposable.remapDisposed]]
 */
export interface RemapOptions {
  retainProperties?: string[]
}

/**
 * Represents an error when attempting to make an object disposable when using [[Disposable.makeDisposable]]
 */
export class DisposableTypeError extends AppError {
  constructor(message?: string) {
    super(message)
  }
}

/**
 * Thrown when [[Disposable.makeDisposable]] is called and the provided {@see DisposeFn} is not a valid `function`
 */
export class DisposableFunctionError extends AppError {
  constructor(message?: string) {
    super(message)
  }
}

/**
 * Thrown when a particular instance of a {@see Disposable} implementation cannot be disposed
 */
export class InvalidDisposeTargetError extends AppError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * Thrown when attempting to dispose a {@see Disposable} instance multiple times
 */
export class AlreadyDisposedError extends AppError {
  constructor(public readonly target: any, public readonly reason: string) {
    super(`The target has already been disposed and cannot be used: ${reason}`)
  }
}

function throwAlreadyDisposed(target: any, reason: string): never {
  throw new AlreadyDisposedError(target, reason)
}

export class Disposable {

  /**
   * Returns `true` if `obj` implements {@see Disposable} (explicitly or implicitly); otherwise, `false`.
   *
   * @oaram obj The object to check
   */
  public static isDisposable(obj: any): obj is Disposable {
    return (obj && typeof obj.dispose === 'function') || false
  }

  /**
   * Returns `true` if `obj` has been marked as disposed using [[Disposable.remapDisposed]]; otherwise, `false`
   *
   * @oaram obj The object to check
   */
  public static isDisposed(obj: any): boolean {
    return obj && obj[DISPOSED] || false
  }

  /**
   * If `obj` has been disposed with [[Disposable.remapDisposed]], returns the `reason` specified. The `obj` has not
   * been disposed, returns `undefined`.
   *
   * @param obj The object to check
   */
  public static getDisposedReason(obj: any): string {
    return obj[DISPOSED_REASON]
  }

  /**
   * Modifies the specified object to add the provided {@see DisposeFn} as the [[Disposable.dispose]]
   * implementation. If the object already has a function member named `dispose`, it is wrapped and called
   * before the new function.
   *
   * @param obj The object to convert to a {@see Disposable} instance
   * @param dispose The {@see DisposeFn} to invoke when disposing of `obj`
   */
  public static makeDisposable<T>(obj: T, dispose: DisposeFn): T & Disposable {
    if (!obj || typeof obj !== 'object') {
      throw new DisposableTypeError(`Cannot make ${obj} disposable`)
    }

    if (typeof dispose !== 'function') {
      throw new DisposableFunctionError('dispose must be a function')
    }

    if (!Disposable.isDisposable(obj)) {
      (obj as any).dispose = dispose
      return obj as T & Disposable
    }

    const ogDispose = obj.dispose
    obj.dispose = (reason: string) => {
      let ogError: Error
      try {
        ogDispose(reason)
      } catch (err) {
        ogError = err
      } finally {
        dispose(reason)
      }

      if (ogError) {
        throw ogError
      }
    }
    return obj
  }

  /**
   * Invokes the specified synchronous function, then disposes the object.
   *
   * `obj` will be disposed with the reason `"after Disposable.use()"`.
   *
   * @typeparam T The type of `obj`
   * @typeparam TResult The type returned by `use`
   * @param obj The {@see Disposable} instance to use
   * @param use The function to invoke
   */
  public static use<T extends Disposable, TResult = void>(obj: T, use: (obj: T) => TResult): TResult {
    let error: Error
    try {
      return use(obj)
    } catch (err) {
      error = err
    } finally {
      if (Disposable.isDisposable(obj)) {
        obj.dispose('after Disposable.use()')
      }
    }

    throw error
  }

  /**
   * Invokes the specified synchronous or asynchronous function, then disposes the object.
   *
   * `obj` (or the instance it resolves to) will be disposed with the reason `"after Disposable.useAsync()"`.
   *
   * @typeparam T The type of `obj`
   * @typeparam TResult The type returned by `use`
   * @param obj The {@see Disposable} instance to use, or, a `Promise<T>` that resolves to a {@see Disposable} instance
   * @param use The function to invoke
   */
  public static async useAsync<T extends Disposable, TResult = void>(
    obj: T | Promise<T>,
    use: (obj: T) => Promise<TResult>,
  ): Promise<TResult> {
    const resolvedObj = isPromise(obj) ? await obj : obj
    try {
      return await use(resolvedObj)
    } catch (err) {
      throw err
    } finally {
      if (Disposable.isDisposable(resolvedObj)) {
        await resolvedObj.dispose('after Disposable.useAsync()')
      }
    }
  }

  /**
   * Overwrites or overrides the `target`'s instance members so that any subsequent member access will result in an
   * {@see AlreadyDisposedError}. After being called, [[Disposable.isDisposed]] will return `true` for `target`, and
   * [[Disposable.getDisposedReason]] will return `reason`. `target` will also be "frozen" with `Object.freeze`,
   * preventing further modification of the instance.
   *
   * @typeparam T The type of `target`
   * @param target The instance to dispose
   * @param reason A brief description of why `target` is being disposed
   * @param options An optional {@see RemapOptions} object to customize the remapping behavior
   */
  public static remapDisposed<T>(target: T, reason: string, options?: RemapOptions): T {
    Object.defineProperty(target, DISPOSED, {
      get: () => true,
      set: undefined,
      configurable: false,
    })
    Object.defineProperty(target, DISPOSED_REASON, {
      get: () => reason,
      configurable: false,
    })
    if (Disposable[DISABLE_REMAP]) {
      return target
    }
    const thrower = throwAlreadyDisposed.bind(target, target, reason)
    for (const prop in target) {
      if (prop === DISPOSED || (options && options.retainProperties && options.retainProperties.includes(prop))) {
        continue
      }
      if (typeof target[prop] === 'function') {
        target[prop] = thrower
      } else {
        Object.defineProperty(target, prop, {
          get: thrower,
          set: undefined,
          configurable: false,
        })
      }
    }
    return Object.freeze(target)
  }
}

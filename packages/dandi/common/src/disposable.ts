import { AppError } from './app-error'
import { DISABLE_REMAP } from './disposable-flags'
import { globalSymbol } from './global-symbol'
import { isPromise } from './promise'

export type DisposeFn = (reason: string) => void

export const DISPOSING = globalSymbol('Disposable.DISPOSING')
export const DISPOSED = globalSymbol('Disposable.DISPOSED')
export const DISPOSED_REASON = globalSymbol('Disposable.DISPOSED_REASON')

export interface Disposable {
  dispose(reason: string): void | Promise<void>
}

export interface RemapOptions {
  retainProperties?: string[]
}

export class DisposableTypeError extends AppError {
  constructor(message?: string) {
    super(message)
  }
}

export class DisposableFunctionError extends AppError {
  constructor(message?: string) {
    super(message)
  }
}

export class InvalidDisposeTargetError extends AppError {
  constructor(message: string) {
    super(message)
  }
}

export class AlreadyDisposedError extends AppError {
  constructor(public readonly target: any, public readonly reason: string) {
    super(`The target has already been disposed and cannot be used: ${reason}`)
  }
}

function throwAlreadyDisposed(target: any, reason: string): never {
  throw new AlreadyDisposedError(target, reason)
}

/**
 * Provides utility functions for working with {@see Disposable} objects.
 */
export class Disposable {
  /**
   * Returns {true} if the object implements {@see Disposable}; otherwise, {false}.
   */
  public static isDisposable(obj: any): obj is Disposable {
    return (obj && typeof obj.dispose === 'function') || false
  }

  public static isDisposed(obj: any): boolean {
    return (obj && obj[DISPOSED]) || false
  }

  public static isDisposing(obj: any): boolean {
    return obj && !!obj[DISPOSING]
  }

  public static canDispose(obj: any): obj is Disposable {
    return !Disposable.isDisposed(obj) && Disposable.isDisposable(obj) && !Disposable.isDisposing(obj)
  }

  public static getDisposedReason(obj: any): string {
    return obj[DISPOSED_REASON]
  }

  public static async dispose(obj: any, reason: string): Promise<void> {
    if (Disposable.canDispose(obj)) {
      Disposable.markDisposing(obj, reason)
      const disposeResult = obj.dispose(reason)
      if (isPromise(disposeResult)) {
        await disposeResult
      }
    }
  }

  public static markDisposing(obj: any, reason: string): void {
    obj[DISPOSING] = reason
  }

  /**
   * Modifies the specified object to add the provided {@see DisposeFn} as the {@see Disposable.dispose}
   * implementation. If the object already has a function member named {dispose}, it is wrapped and called
   * before the new function.
   */
  public static makeDisposable<T>(obj: T, dispose: DisposeFn): T & Disposable {
    const objType = typeof obj
    if (!obj || (objType !== 'object' && objType !== 'function')) {
      throw new DisposableTypeError(`Cannot make ${obj} disposable`)
    }

    if (typeof dispose !== 'function') {
      throw new DisposableFunctionError('dispose must be a function')
    }

    if (!Disposable.isDisposable(obj)) {
      ;(obj as any).dispose = dispose
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
   * Invokes the specified function, then disposes the object.
   */
  public static use<T = any, TResult = void>(obj: T, use: (obj: T) => TResult): TResult {
    let error: Error
    try {
      return use(obj)
    } catch (err) {
      error = err
    } finally {
      Disposable.dispose(obj, `after Disposable.use() for ${obj.constructor.name}`)
    }

    throw error
  }

  public static async useAsync<T = any, TResult = void>(
    obj: T | Promise<T>,
    use: (obj: T) => Promise<TResult>,
  ): Promise<TResult> {
    const resolvedObj = isPromise(obj) ? await obj : obj
    try {
      return await use(resolvedObj)
    } finally {
      await Disposable.dispose(resolvedObj, `after Disposable.useAsync() for ${obj.constructor.name}`)
    }
  }

  public static remapDisposed<T>(target: T, reason: string, options?: RemapOptions): Readonly<T> {
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
    for (const prop of Object.getOwnPropertyNames(target)) {
      if (options && options.retainProperties && options.retainProperties.includes(prop)) {
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
    return target
    // TODO - Object.freeze seems to have a bit of overhead, is it really necessary?
    // return Object.freeze(target)
  }
}

import { AsyncMutexLockAlreadyReleasedError } from './async-mutex-lock-already-released-error'
import { AlreadyDisposedError, Disposable } from './disposable'
import { globalSymbol } from './global-symbol'

const RELEASED = globalSymbol('AsyncMutex.RELEASED')

export type LockedObject<T> = T & Disposable

function lockedObject<T extends object>(obj: T, released: Promise<void>, dispose: () => void): LockedObject<T> {
  return Object.defineProperties(Object.create(obj), {
    [RELEASED]: {
      value: released,
      configurable: false,
      writable: false,
    },
    dispose: {
      value: dispose,
      configurable: false,
      writable: false,
    },
  })
}

function throwAlreadyReleased(): never {
  throw new AsyncMutexLockAlreadyReleasedError()
}

const MUTEXES = new Map<any, AsyncMutex<any>>()
const DISPOSED_ERROR = 'The lock request was rejected because the underlying mutex was disposed'

export class AsyncMutex<T extends object> implements Disposable {
  public static for<T extends object>(obj: T): AsyncMutex<T> {
    let mutex = MUTEXES.get(obj)
    if (!mutex) {
      mutex = new AsyncMutex(obj)
      MUTEXES.set(obj, mutex)
    }
    return mutex
  }

  private locks = []

  private constructor(private lockObject: T) {
    if (!this.lockObject) {
      throw new Error('An lockObject must be specified')
    }
  }

  public async runLocked<TResult>(fn: (lock?: LockedObject<T>) => Promise<TResult>): Promise<TResult> {
    return Disposable.useAsync(this.getLock(), fn)
  }

  public async getLock(): Promise<LockedObject<T>> {
    let release: Function
    const released = new Promise<void>((resolve) => (release = resolve))
    const lock = lockedObject<T>(this.lockObject, released, () => {
      if (release) {
        if (this.locks[0] !== lock) {
          throw new Error('should not happen!')
        }
        this.locks.shift()
        for (const prop of Object.getOwnPropertyNames(Object.getPrototypeOf(this.lockObject))) {
          if (prop === 'constructor' || prop === 'dispose') {
            continue
          }
          Object.defineProperty(lock, prop, {
            get: throwAlreadyReleased,
            configurable: false,
          })
        }
        release()
        release = undefined
      }
    })
    const prevLock = this.locks[this.locks.length - 1]
    this.locks.push(lock)
    if (prevLock) {
      await prevLock[RELEASED]
    }
    if (Disposable.isDisposed(this)) {
      throw new AlreadyDisposedError(this, `${DISPOSED_ERROR}: ${Disposable.getDisposedReason(this)}`)
    }
    return lock
  }

  public async dispose(reason: string): Promise<void> {
    MUTEXES.delete(this.lockObject)
    if (Disposable.isDisposable(this.lockObject) && !Disposable.isDisposed(this.lockObject)) {
      await this.lockObject.dispose(reason)
    }
    if (!Disposable.isDisposable(this)) {
      Disposable.remapDisposed(this, reason)
    }
  }
}

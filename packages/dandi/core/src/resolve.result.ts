import { Disposable } from '@dandi/common'

export class ResolveResult<T> implements Disposable {
  public constructor(private readonly context: Disposable, private readonly _value: T | T[]) {}

  public get value(): T | T[] {
    return this._value
  }

  public get singleValue(): T {
    return this.value as T
  }

  public get arrayValue(): T[] {
    return this.value as T[]
  }

  public dispose(reason: string): void {
    this.context.dispose(`Disposing ResolveResult: ${reason}`)
  }
}

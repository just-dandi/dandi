export class InjectionResult<T> {
  public readonly singleValue: T
  public readonly arrayValue: T[]

  public constructor(public readonly value: T | T[]) {
    this.singleValue = value as T
    this.arrayValue = value as T[]
  }
}

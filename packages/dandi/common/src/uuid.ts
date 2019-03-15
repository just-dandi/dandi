import * as uuid from 'uuid/v4'

const UUID = new Map<string, Uuid>()

/**
 * An implementation of UUID values based on [uuid/v4](https://www.npmjs.com/package/uuid). [[Uuid]] instances are
 * immutable (due to the constructor calling `Object.freeze`), and when constructed purely with [[Uuid.for]], can be
 * compared as value types.
 *
 * ```typescript
 * const uuidStr = '32d9d213-3ebf-4c9d-bb80-4f5cd47ad7d7'
 *
 * Uuid.for(uuidStr) === Uuid.for(uuidStr) // true
 * new Uuid(uuidStr) === new Uuid(uuidStr) // false
 * Uuid.for(uuiStr)  === new Uuid(uuidStr) // false
 *
 * const myUuid = Uuid.create()
 * myUuid === Uuid.for(myUuid.toString())  // true
 * ```
 *
 * @noInheritDoc
 */
export class Uuid extends String {

  /**
   * Returns a [[Uuid]] instance representing the specified `value` string. If the application has previously
   * initialized a [[Uuid]] instance for this particular `value`, that instance is returned. Otherwise, a new instance
   * is created, and will be returned for future calls to [[Uuid.for]] with the same `value`.
   * @param value
   */
  public static for(value: string): Uuid {
    if ((value as any) instanceof Uuid) {
      return value
    }
    let uuid = UUID.get(value)
    if (!uuid) {
      uuid = new Uuid(value)
      UUID.set(value, uuid)
    }
    return uuid
  }

  /**
   * Creates a [[Uuid]] instance containing a random v4 UUID using [[Uuid.for]].
   */
  public static create(): Uuid {
    return this.for(uuid())
  }

  public constructor(private readonly value?: string) {
    super((value as any) instanceof Uuid ? value.valueOf() : value)
    Object.freeze(this)
  }

  /**
   * Returns the string representation of the UUID
   */
  public toString(): string {
    return this.value
  }

  /**
   * Returns the string representation of the UUID
   */
  public valueOf(): string {
    return this.value
  }
}

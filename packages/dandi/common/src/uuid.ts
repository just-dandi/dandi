import * as uuid from 'uuid/v4'

const UUID = new Map<string, Uuid>()

export class Uuid extends String {
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

  public static create(): Uuid {
    return this.for(uuid())
  }

  public constructor(private readonly value?: string) {
    super((value as any) instanceof Uuid ? value.valueOf() : value)
    Object.freeze(this)
  }

  public toString(): string {
    return this.value
  }

  public valueOf(): string {
    return this.value
  }
}

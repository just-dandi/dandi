export interface MimeTypeInfo {
  readonly type: string
  readonly source: string
  readonly subtype: string
  readonly fullType: string
  readonly subtypeBase?: string
  readonly weight?: number
}

export class MimeTypeInfo {
  public readonly type: string
  public readonly source: string
  public readonly subtype: string
  public readonly fullType: string
  public readonly subtypeBase?: string
  public readonly weight?: number

  constructor(parsedInfo: MimeTypeInfo) {
    Object.assign(this, parsedInfo)
  }

  public toString(): string {
    return this.fullType
  }
}

const CURRENCY_PATTERN = /^(\D+)?(\d+\.\d{0,2})$/

const values = new Map<string, Currency>()

export class Currency extends Number {
  public static parse(value: string): Currency {
    if (value === null || value === undefined) {
      return new Currency(parseInt(value))
    }
    const intValue = parseInt(value, 10)

    if (!isNaN(intValue)) {
      return Currency.value(intValue)
    }

    const match = value.match(CURRENCY_PATTERN)
    if (!match) {
      return Currency.value(intValue)
    }
    // TODO: get list of currency symbols, validate whether the symbol match is a valid currency symbol
    // TODO: support currencies that have a symbol after the value
    return Currency.value(parseInt(match[2], 10), match[1])
  }

  public static value(amount: number, code?: string): Currency {
    let key = amount.toString()
    if (code) {
      key += code
    }
    const cachedValue = values.get(key)
    if (cachedValue) {
      return cachedValue
    }
    const value = new Currency(amount, code)
    values.set(key, value)
    return value
  }

  public static readonly zero = Currency.value(0)

  public get valid(): boolean {
    return !isNaN(this.valueOf())
  }

  constructor(value: number, public readonly code?: string) {
    super(value)
    Object.freeze(this)
  }

  public toString() {
    return this.toDisplayString()
  }

  public toDisplayString(display: 'symbol' | 'code' | 'name' = 'symbol') {
    return this.toLocaleString(null, {
      style: 'currency',
      currency: this.code,
      currencyDisplay: display,
    })
  }

  public equals(other: Number): boolean {
    if (other instanceof Currency) {
      return this.valueOf() === other.valueOf() && this.code === other.code
    }
    return this.valueOf() === other.valueOf()
  }
}

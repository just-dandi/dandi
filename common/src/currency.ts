const CURRENCY_PATTERN = /^(\D+)?(\d+\.\d{0,2})$/;

export class Currency extends Number {
  public static parse(value: string): Currency {
    if (value === null || value === undefined) {
      return new Currency(parseInt(value));
    }
    const intValue = parseInt(value, 10);

    if (!isNaN(intValue)) {
      return new Currency(intValue);
    }

    const match = value.match(CURRENCY_PATTERN);
    if (!match) {
      return new Currency(intValue);
    }
    // TODO: get list of currency symbols, validate whether the symbol match is a valid currency symbol
    return new Currency(parseInt(match[2], 10), match[1]);
  }

  public get valid(): boolean {
    return !isNaN(this.valueOf());
  }

  constructor(value: number, public readonly code?: string) {
    super(value);
  }

  public toString() {
    return this.toDisplayString();
  }

  public toDisplayString(display: 'symbol' | 'code' | 'name' = 'symbol') {
    return this.toLocaleString(null, {
      style: 'currency',
      currency: this.code,
      currencyDisplay: display,
    });
  }

  public equals(other: Number): boolean {
    if (other instanceof Currency) {
      return this.valueOf() === other.valueOf() && this.code === other.code;
    }
    return this.valueOf() === other.valueOf();
  }
}

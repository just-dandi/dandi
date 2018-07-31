const tokens = new Map<string, SymbolToken<any>>();

export abstract class SymbolTokenBase<T> {
  private readonly symbol: symbol;

  protected constructor(private desc: string) {
    this.symbol = Symbol(this.desc);
  }

  public valueOf(): symbol {
    return this.symbol;
  }

  public toString(): string {
    return `SymbolToken[${this.desc}]`;
  }

  protected ready() {
    Object.freeze(this);
  }
}

export class SymbolToken<T> extends SymbolTokenBase<T> {
  public static local<T>(pkg: string, target: string): SymbolToken<T> {
    return new SymbolToken<T>(`${pkg}#${target}`);
  }

  public static forLocal<T>(pkg: string, target: string): SymbolToken<T> {
    return SymbolToken.for<T>(`${pkg}#${target}`);
  }

  public static for<T>(desc: string): SymbolToken<T> {
    let token = tokens.get(desc);
    if (!token) {
      token = new SymbolToken<T>(desc);
      tokens.set(desc, token);
    }
    return token;
  }

  constructor(desc: string) {
    super(desc);
    this.ready();
  }
}

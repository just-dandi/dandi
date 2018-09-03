export type GlobalSymbolFn = (desc: string) => symbol;

export function packageGlobalSymbol(pkg: string, desc: string): symbol {
  return Symbol.for(`${pkg}#${desc}`);
}

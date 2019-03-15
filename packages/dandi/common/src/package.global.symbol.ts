export type GlobalSymbolFn = (desc: string) => symbol

/**
 * @ignore
 * @internal
 */
export function packageGlobalSymbol(pkg: string, desc: string): symbol {
  return Symbol.for(`${pkg}#${desc}`)
}

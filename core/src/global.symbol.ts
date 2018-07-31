export function globalSymbol(desc: string): symbol {
  return Symbol.for(`@dandi/common#${desc}`);
}

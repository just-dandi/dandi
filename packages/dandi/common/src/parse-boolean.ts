import { globalSymbol } from './global.symbol'

export type NaB = symbol & {
  [Symbol.toStringTag]: () => '@dandi/common#NaB'
}

export const NaB: NaB = globalSymbol('NaB') as NaB

export function parseBoolean(value: any): boolean | NaB {
  switch (typeof value) {
    case 'boolean':
      return value

    case 'number':
      if (value === 0) {
        return false
      }
      if (value === 1) {
        return true
      }
      return NaB

    case 'string':
      value = value.toLocaleLowerCase()
      if (value === 'true') {
        return true
      }
      if (value === 'false') {
        return false
      }
      return NaB
  }

  return NaB
}

export function isNaB(value: any): value is NaB {
  return value === NaB
}

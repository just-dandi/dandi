import { GlobalSymbolFn, packageGlobalSymbol } from '@dandi/common'

export const globalSymbol: GlobalSymbolFn = packageGlobalSymbol.bind(null, '@dandi/mvc')

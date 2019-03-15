import { GlobalSymbolFn, packageGlobalSymbol } from './package.global.symbol'

/**
 * @internal
 * @ignore
 */
export const globalSymbol: GlobalSymbolFn = packageGlobalSymbol.bind(null, '@dandi/common')

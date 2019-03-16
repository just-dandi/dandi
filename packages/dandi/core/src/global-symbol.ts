import { GlobalSymbolFn, packageGlobalSymbol } from '@dandi/common'

/**
 * @ignore
 * @internal
 */
export const globalSymbol: GlobalSymbolFn = packageGlobalSymbol.bind(null, '@dandi/core')

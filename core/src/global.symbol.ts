import { GlobalSymbolFn, packageGlobalSymbol } from './package.global.symbol';

export const globalSymbol: GlobalSymbolFn = packageGlobalSymbol.bind(null, '@dandi/core');

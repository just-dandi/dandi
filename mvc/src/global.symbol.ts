import { GlobalSymbolFn, packageGlobalSymbol } from '@dandi/core';

export const globalSymbol: GlobalSymbolFn = packageGlobalSymbol.bind(null, '@dandi/mvc');

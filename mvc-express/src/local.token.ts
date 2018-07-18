import { InjectionOptions, InjectionToken, OpinionatedToken, SymbolToken } from '@dandi/di-core';

const PKG = '@dandi/mvc/express';

export function localSymbolToken<T>(target: string): InjectionToken<T> {
    return SymbolToken.local<T>(PKG, target);
}
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
    return OpinionatedToken.local<T>(PKG, target, options);
}

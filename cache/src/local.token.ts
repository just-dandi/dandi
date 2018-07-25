import { InjectionOptions, InjectionToken, OpinionatedToken, SymbolToken } from '@dandi/core';

const PKG = '@dandi/cache';

export function localSymbolToken<T>(target: string): InjectionToken<T> {
    return SymbolToken.local<T>(PKG, target);
}
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
    return OpinionatedToken.local<T>(PKG, target, options);
}

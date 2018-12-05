import { InjectionOptions, InjectionToken, OpinionatedToken, SymbolToken } from '@dandi/core';

export const PKG = '@dandi/mvc-view';

export function localSymbolTokenFor<T>(target: string): InjectionToken<T> {
  return SymbolToken.forLocal<T>(PKG, target);
}

export function localSymbolToken<T>(target: string): InjectionToken<T> {
  return SymbolToken.local<T>(PKG, target);
}
export function localOpinionatedToken<T>(target: string, options: InjectionOptions): InjectionToken<T> {
  return OpinionatedToken.local<T>(PKG, target, options);
}

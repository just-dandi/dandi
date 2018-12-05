import { InjectionToken, MappedInjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { ViewMetadata } from './view-metadata';

export interface ViewEngine {
  render(view: ViewMetadata, data?: any): string | Promise<string>;
}

const tokens = new Map<string, MappedInjectionToken<string, ViewEngine>>();

export function ViewEngine(extension: string): InjectionToken<ViewEngine> {
  let token: MappedInjectionToken<string, ViewEngine> = tokens.get(extension);
  if (!token) {
    token = {
      provide: localOpinionatedToken<ViewEngine>(`ViewEngine:${extension}`, {
        multi: false,
      }),
      key: extension,
    };
    tokens.set(extension, token);
  }
  return token;
}

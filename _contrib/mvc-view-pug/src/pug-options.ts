import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export type PugFilter = (text: string, options?: any) => string

export interface PugOptions {
  filename?: string;
  basedir?: string;
  doctype?: string;
  pretty?: string;
  filters?: { [key: string]: PugFilter };
  self?: boolean;
  debug?: boolean;
  compileDebug?: boolean;
  globals?: string[];
  cache?: boolean;
  inlineRuntimeFunctions?: boolean;
  name?: string;
  [key: string]: any;
}

export const PugOptions: InjectionToken<PugOptions> = localOpinionatedToken('PugOptions', { multi: false })

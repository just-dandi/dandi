import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export interface EjsOptions {
  cache?: boolean;
  filename?: string;
  context?: string;
  compileDebug?: boolean;
  client?: boolean;
  debug?: boolean;
  _with?: boolean;
  localsName?: string;
  rmWhitespace?: boolean;
  escape?: (value: string) => string;
  outputFunctioName?: string;
  async?: boolean;
}

export const EjsOptions: InjectionToken<EjsOptions> = localOpinionatedToken('EjsOptions', { multi: false })

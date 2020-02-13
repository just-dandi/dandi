import { InjectionToken } from '@dandi/core'

import { localToken } from './local-token'

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

export const EjsOptions: InjectionToken<EjsOptions> = localToken.opinionated<EjsOptions>('EjsOptions', { multi: false })

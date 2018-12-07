import { Constructor } from '@dandi/common'
import { InjectionToken } from '@dandi/core'

import { ViewEngine } from './view-engine'
import { localOpinionatedToken } from './local.token'

export interface ViewEngineConfig {
  engine: Constructor<ViewEngine>;
  extension: string;
  priority?: number;
}

export const ViewEngineConfig: InjectionToken<ViewEngineConfig> = localOpinionatedToken('ViewEngineConfig', {
  multi: true,
})

import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'

import { localToken } from './local-token'
import { ViewEngineErrorConfig } from './view-engine-config'
import { ViewMetadata } from './view-metadata'

export interface ViewEngine {
  render(view: ViewMetadata, templatePath: string, data?: any): string | Promise<string>
}

export const ViewEngine: InjectionToken<ViewEngine[]> = localToken.opinionated<ViewEngine[]>('ViewEngine', {
  multi: true,
})

export type ConfiguredViewEngine = [Constructor<ViewEngine>, Provider<ViewEngineErrorConfig>, ...Provider<any>[]]

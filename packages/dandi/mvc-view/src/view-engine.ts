import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local.token'
import { ViewMetadata } from './view-metadata'

export interface ViewEngine {
  render(view: ViewMetadata, templatePath: string, data?: any): string | Promise<string>;
}

export const ViewEngine: InjectionToken<ViewEngine[]> = localOpinionatedToken('ViewEngine', {
  multi: true,
})

export type ConfiguredViewEngine = [Constructor<ViewEngine>, Provider<any>]

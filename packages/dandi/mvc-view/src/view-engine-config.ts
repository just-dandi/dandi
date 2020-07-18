import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { HttpStatusCode } from '@dandi/http'

import { localToken } from './local-token'
import { ViewEngine } from './view-engine'

export interface ViewEngineConfig {
  engine: Constructor<ViewEngine>
  extension: string
  priority?: number
}

export const ViewEngineConfig: InjectionToken<ViewEngineConfig> = localToken.opinionated<ViewEngineConfig>(
  'ViewEngineConfig',
  {
    multi: true,
  },
)

export type ViewEngineHttpStatusErrorConfig = { [TKey in HttpStatusCode]?: string }

export interface ViewEngineDefaultErrorTemplateConfig {
  default: string
}

export type ViewEngineErrorTemplateConfig = ViewEngineHttpStatusErrorConfig &
  Partial<ViewEngineDefaultErrorTemplateConfig>

export interface ViewEngineErrorConfig {
  templates?: ViewEngineErrorTemplateConfig
}

export const DefaultViewEngineErrorConfig: ViewEngineErrorConfig = {}

export const ViewEngineErrorConfig: InjectionToken<ViewEngineErrorConfig> = localToken.opinionated<
  ViewEngineErrorConfig
>('ViewEngineErrorConfig', {
  multi: true,
})

/**
 * @internal
 */
export const ViewEngineMergedErrorConfig: InjectionToken<ViewEngineErrorConfig> = localToken.opinionated<
  ViewEngineErrorConfig
>('ViewEngineMergedErrorConfig', {
  multi: false,
})

function viewEngineMergedErrorConfigFactory(configs: ViewEngineErrorConfig[]): ViewEngineErrorConfig {
  return configs.reduce((merged, config) => {
    return Object.assign(merged, config, {
      templates: Object.assign({}, merged.templates || {}, config.templates),
    })
  }, Object.assign({}, DefaultViewEngineErrorConfig))
}

/**
 * @internal
 */
export const ViewEngineMergedErrorConfigProvider: Provider<ViewEngineErrorConfig> = {
  provide: ViewEngineMergedErrorConfig,
  useFactory: viewEngineMergedErrorConfigFactory,
  deps: [ViewEngineErrorConfig],
}

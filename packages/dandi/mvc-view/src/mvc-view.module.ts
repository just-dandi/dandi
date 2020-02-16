import { Constructor } from '@dandi/common'
import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { MvcViewRenderer } from './mvc-view-renderer'
import { ConfiguredViewEngine, ViewEngine } from './view-engine'
import {
  ViewEngineConfig,
  ViewEngineErrorConfig,
  ViewEngineMergedErrorConfigProvider,
  DefaultViewEngineErrorConfig,
} from './view-engine-config'
import { ViewEngineResolver } from './view-engine-resolver'
import { VIEW_RESULT_FACTORY } from './view-result-factory'
import { ViewRouteTransformer } from './view.route-transformer'

export interface MvcViewModule extends Array<any> {
  engine(extension: string, engine: Constructor<ViewEngine>): this
}

export class MvcViewModuleBuilder extends ModuleBuilder<MvcViewModuleBuilder> {

  private rendererRegistered = false

  constructor(...entries: Registerable[]) {
    super(MvcViewModuleBuilder, localToken.PKG, ...entries)
  }

  public engine(
    extension: string,
    engineInfo: ConfiguredViewEngine,
    priority?: number,
  ): this {
    const engine = Array.isArray(engineInfo) ? engineInfo[0] : engineInfo
    if (!this.rendererRegistered) {
      this.add(MvcViewRenderer)
      this.rendererRegistered = true
    }
    return this.add(engineInfo, {
      provide: ViewEngineConfig,
      useValue: {
        engine,
        extension,
        priority,
      },
    })
  }

  public errorConfig(config: ViewEngineErrorConfig): this {
    return this.add({
      provide: ViewEngineErrorConfig,
      useValue: config,
    })
  }
}

export const MvcViewModule = new MvcViewModuleBuilder(
  VIEW_RESULT_FACTORY,
  ViewEngineResolver,
  ViewRouteTransformer,
  ViewEngineMergedErrorConfigProvider,
  {
    provide: ViewEngineErrorConfig,
    useValue: DefaultViewEngineErrorConfig,
  },
)

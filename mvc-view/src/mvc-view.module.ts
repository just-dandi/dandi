import { Constructor } from '@dandi/common';
import { ModuleBuilder, Registerable } from '@dandi/core';

import { PKG } from './local.token';
import { VIEW_RENDERER } from './render-view';
import { ConfiguredViewEngine, ViewEngine } from './view-engine';
import { ViewEngineResolver } from './view-engine-resolver';
import { ViewControllerResultTransformer } from './view.controller-result-transformer';
import { ViewRouteTransformer } from './view.route-transformer';
import { ViewEngineConfig } from './view-engine-config';

export interface MvcViewModule extends Array<any> {
  engine(extension: string, engine: Constructor<ViewEngine>): this;
}

export class MvcViewModuleBuilder extends ModuleBuilder<MvcViewModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcViewModuleBuilder, PKG, ...entries);
  }

  public engine(
    extension: string,
    engineInfo: Constructor<ViewEngine> | ConfiguredViewEngine,
    priority?: number,
  ): this {
    const engine = Array.isArray(engineInfo) ? engineInfo[0] : engineInfo;
    return this.add(engine, {
      provide: ViewEngineConfig,
      useValue: {
        engine,
        extension,
        priority,
      },
    });
  }
}

export const MvcViewModule = new MvcViewModuleBuilder(
  VIEW_RENDERER,
  ViewControllerResultTransformer,
  ViewEngineResolver,
  ViewRouteTransformer,
);

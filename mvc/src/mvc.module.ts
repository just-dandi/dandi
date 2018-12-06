import { ModuleBuilder, Registerable } from '@dandi/core';

import { DefaultRouteExecutor } from './default.route.executor';
import { DefaultRouteInitializer } from './default.route.initializer';
import { DefaultRouteHandler } from './default.route.handler';
import { PKG } from './local.token';

export class MvcModuleBuilder extends ModuleBuilder<MvcModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcModuleBuilder, PKG, ...entries);
  }
}

export const MvcModule = new MvcModuleBuilder(DefaultRouteExecutor, DefaultRouteHandler, DefaultRouteInitializer);

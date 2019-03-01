import { ModuleBuilder, Registerable } from '@dandi/core'

import { DefaultRouteExecutor } from './default.route.executor'
import { DefaultRouteInitializer } from './default.route.initializer'
import { DefaultRouteHandler } from './default.route.handler'
import { PKG } from './local.token'
import { MvcResponseRendererProvider } from './mvc-response-renderer'
import { NativeJsonObjectRenderer } from './native-json-object-renderer'
import { DefaultObjectRenderer } from './object-renderer'
import { RequestAcceptTypesProvider } from './request-accept-types'

export class MvcModuleBuilder extends ModuleBuilder<MvcModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcModuleBuilder, PKG, ...entries)
  }
}

export const MvcModule = new MvcModuleBuilder(
  DefaultRouteExecutor,
  DefaultRouteHandler,
  DefaultRouteInitializer,
  RequestAcceptTypesProvider,
  MvcResponseRendererProvider,
  DefaultObjectRenderer.use(NativeJsonObjectRenderer),
)

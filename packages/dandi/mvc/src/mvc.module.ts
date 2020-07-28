import { ModuleBuilder, Registerable } from '@dandi/core'
import { HttpModule } from '@dandi/http'
import { HttpPipelineModule } from '@dandi/http-pipeline'

import { DandiRouteExecutor } from './dandi-route-executor'
import { DandiRouteGenerator } from './dandi-route-generator'
import { DandiRouteInitializer } from './dandi-route-initializer'
import { localToken } from './local-token'
import { ROUTES_PROVIDER } from './routes'

export class MvcModuleBuilder extends ModuleBuilder<MvcModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcModuleBuilder, localToken.PKG, ...entries)
  }
}

export const MvcModule = new MvcModuleBuilder(
  HttpModule,
  HttpPipelineModule,
  ROUTES_PROVIDER,
  DandiRouteGenerator,
  DandiRouteExecutor,
  DandiRouteInitializer,
)

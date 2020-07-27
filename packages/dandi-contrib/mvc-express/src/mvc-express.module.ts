import { ModuleBuilder, Registerable } from '@dandi/core'
import { MvcModule } from '@dandi/mvc'

import { ExpressInstanceProvider } from './express-instance'
import { ExpressMvcApplication } from './express-mvc-application'
import { ExpressMvcConfig } from './express-mvc-config'
import { ExpressMvcRouteMapper } from './express-mvc-route-mapper'
import { localToken } from './local-token'

export class MvcExpressModuleBuilder extends ModuleBuilder<MvcExpressModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcExpressModuleBuilder, localToken.PKG, entries)
  }

  public config(mvcConfig: ExpressMvcConfig): this {
    return this.add({ provide: ExpressMvcConfig, useValue: mvcConfig })
  }
}

export const MvcExpressModule = new MvcExpressModuleBuilder(
  MvcModule,
  ExpressInstanceProvider,
  ExpressMvcApplication,
  ExpressMvcRouteMapper,
)

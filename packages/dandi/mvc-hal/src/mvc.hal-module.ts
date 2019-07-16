import { ModuleBuilder, Registerable } from '@dandi/core'

import { DefaultResourceComposer } from './default.resource.composer'
import { HalObjectRenderer } from './hal-object-renderer'
import { HalResultTransformer } from './hal.result.transformer'
import { PKG } from './local.token'

export class MvcHalModuleBuilder extends ModuleBuilder<MvcHalModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcHalModuleBuilder, PKG, ...entries)
  }
}

export const MvcHalModule = new MvcHalModuleBuilder(DefaultResourceComposer, HalResultTransformer, HalObjectRenderer)

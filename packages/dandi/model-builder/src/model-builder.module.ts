import { ModuleBuilder, Registerable } from '@dandi/core'

import { localToken } from './local-token'
import { MetadataModelBuilder } from './metadata-model-builder'
import { TypeConverters } from './type-converters'

export class ModelBuilderModuleBuilder extends ModuleBuilder<ModelBuilderModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ModelBuilderModuleBuilder, localToken.PKG, entries)
  }
}

export const ModelBuilderModule = new ModelBuilderModuleBuilder(TypeConverters, MetadataModelBuilder)

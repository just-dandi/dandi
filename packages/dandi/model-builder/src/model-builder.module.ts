import { ModuleBuilder, Registerable } from '@dandi/core'

import { PKG } from './local-token'
import { MetadataModelBuilder } from './metadata-model-builder'
import { MetadataModelValidator } from './metadata-model-validator'
import { TypeConverters } from './type-converters'

/**
 * @internal
 * @ignore
 */
export class ModelBuilderModuleBuilder extends ModuleBuilder<ModelBuilderModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(ModelBuilderModuleBuilder, PKG, ...entries)
  }
}

/**
 * A [[Module]] containing the implementations of [[ModelBuilder]], [[ModelValidator]], and [[TypeConverter]] defined
 * in [[@dandi/model-builder]].
 */
export const ModelBuilderModule = new ModelBuilderModuleBuilder(TypeConverters, MetadataModelBuilder, MetadataModelValidator)

import { Constructor } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'
import { getResourceMetadata, HalObject, isHalObject, ResourceMetadata } from '@dandi/hal'
import { MetadataModelBuilder, ModelBuilder, ModelBuilderOptions, PrimitiveTypeConverter } from '@dandi/model-builder'


@Injectable(ModelBuilder)
export class HalModelBuilder extends MetadataModelBuilder {

  constructor(@Inject(PrimitiveTypeConverter) primitive: PrimitiveTypeConverter) {
    super(primitive)
  }

  public constructModel(type: Constructor<any>, source: any, options?: ModelBuilderOptions): any {
    const result = super.constructModel(type, source, options)

    if (isHalObject(source)) {

      result._links = source._links

      if (typeof source._embedded === 'object') {
        result._embedded = this.constructEmbeddedResources(getResourceMetadata(type), source)
      }
    }

    return result
  }

  private constructEmbeddedResources(resourceMeta: ResourceMetadata, source: HalObject, options?: ModelBuilderOptions): { [rel: string]: any } {
    return Object.keys(source._embedded).reduce((embedded, rel) => {
      const relMeta = resourceMeta.relations[rel]
      const relSource = source._embedded[rel]
      if (Array.isArray(relSource)) {
        embedded[rel] = relSource.map(relSourceItem => this.constructModel(relMeta.resource, relSourceItem, options))
      } else {
        embedded[rel] = this.constructModel(relMeta.resource, relSource, options)
      }
      return embedded
    }, {})
  }

}

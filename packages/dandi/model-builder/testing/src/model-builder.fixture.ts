import { Constructor } from '@dandi/common'
import { Provider } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'
import { ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { stub } from 'sinon'

export class ModelBuilderFixture implements ModelBuilder {

  public static get factory(): Provider<ModelBuilder> {
    return {
      provide: ModelBuilder,
      useFactory: () => new ModelBuilderFixture(),
    }
  }

  constructor() {
    stub(this, 'constructMember')
    stub(this, 'constructModel')
  }

  public constructMember(metadata: MemberMetadata, key: string, value: any, options?: ModelBuilderOptions): any {
  }

  public constructModel<T>(type: Constructor<T>, obj: any, options?: ModelBuilderOptions): T {
    return undefined
  }

}

import { Provider } from '@dandi/core'
import { ModelBuilder } from '@dandi/model-builder'

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

  public constructMember(): any {
    return undefined
  }

  public constructModel<T>(): T {
    return undefined
  }

}

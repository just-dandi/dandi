import { ModuleBuilder, Registerable } from '@dandi/core'

import { HttpEventOptions } from './http.event.options'
import { HttpEventTransformer } from './http.event.transformer'
import { HttpResponder } from './http.responder'
import { PKG } from './local.token'

export class AwsLambdaModuleBuilder extends ModuleBuilder<AwsLambdaModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(AwsLambdaModuleBuilder, PKG, ...entries)
  }

  public configure(options: HttpEventOptions): this {
    return this.add({
      provide: HttpEventOptions,
      useValue: options,
    })
  }
}

export const AwsLambdaModule = new AwsLambdaModuleBuilder(HttpResponder, HttpEventTransformer)

import { ModuleBuilder, Registerable } from '@dandi/core'

import { HttpEventOptions } from './http.event.options'
import { HttpEventTransformer } from './http-event-transformer'
import { HttpResponder } from './http.responder'
import { PKG } from './local.token'

// FIXME: refactor to use HttpPipeline from @dandi/http-pipeline
export class AwsLambdaHttpModuleBuilder extends ModuleBuilder<AwsLambdaHttpModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(AwsLambdaHttpModuleBuilder, PKG, ...entries)
  }

  public configure(options: HttpEventOptions): this {
    return this.add({
      provide: HttpEventOptions,
      useValue: options,
    })
  }
}

export const AwsLambdaHttpModule = new AwsLambdaHttpModuleBuilder(HttpResponder, HttpEventTransformer)

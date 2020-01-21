import { ModuleBuilder, Registerable } from '@dandi/core'

import { HttpEventTransformer } from './http-event-transformer'
import { Lambda } from './lambda'
import { LambdaHttpResponse } from './lambda-http-response'
import { LambdaTerminator } from './lambda-terminator'
import { PKG } from './local.token'

export class AwsLambdaHttpModuleBuilder extends ModuleBuilder<AwsLambdaHttpModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(AwsLambdaHttpModuleBuilder, PKG, ...entries)
  }
}

export const AwsLambdaHttpModule = new AwsLambdaHttpModuleBuilder(
  Lambda,
  LambdaHttpResponse,
  LambdaTerminator,
  HttpEventTransformer,
)

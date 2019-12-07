import { ModelBuilderModule } from '@dandi/model-builder'
import { AwsLambdaHttpModule, Lambda } from '@dandi-contrib/aws-lambda'

import { HelloWorldHandler } from './src/hello-world.handler'
import { ReceiveDataHandler } from './src/receive-data.handler'

const HANDLER_DEPS: any[] = [
  ...AwsLambdaHttpModule,
  ...ModelBuilderModule,
]

export const helloWorldHandler = Lambda.handler(HelloWorldHandler, HANDLER_DEPS)
export const receiveDataHandler = Lambda.handler(ReceiveDataHandler, HANDLER_DEPS)

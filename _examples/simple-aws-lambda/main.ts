import { HttpModule } from '@dandi/http'
import { HttpPipelineModule } from '@dandi/http-pipeline'
import { ModelBuilderModule } from '@dandi/model-builder'
import { AwsLambdaHttpModule, Lambda } from '@dandi-contrib/aws-lambda'

import { DataProcessorService } from './src/data-processor.service'
import { HelloWorldHandler } from './src/hello-world.handler'
import { ReceiveDataHandler } from './src/receive-data.handler'

const HANDLER_DEPS: any[] = [
  HttpModule,
  HttpPipelineModule.cors({
    allowOrigin: 'localhost:8085',
  }),
  ModelBuilderModule,
  AwsLambdaHttpModule,
]

export const helloWorldHandler = Lambda.handler(HelloWorldHandler, HANDLER_DEPS)
export const receiveDataHandler = Lambda.handler(ReceiveDataHandler, HANDLER_DEPS, DataProcessorService)

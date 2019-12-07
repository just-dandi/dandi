import { Injectable, Provider } from '@dandi/core'
import { HttpRequestBody } from '@dandi/http'
import { DynamoDBStreamEvent } from 'aws-lambda'

import { LambdaEventTransformer } from './lambda-event-transformer'

@Injectable()
export class DynamoStreamEventTransformer implements LambdaEventTransformer<DynamoDBStreamEvent> {
  public transform(event: DynamoDBStreamEvent): Provider<any>[] {
    return [
      {
        provide: HttpRequestBody,
        useValue: event.Records,
      },
    ]
  }
}

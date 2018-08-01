import { Injectable } from '@dandi/core';

import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';

import { LambdaEventTransformer } from './lambda.event.transformer';

@Injectable()
export class DynamoStreamEventTransformer implements LambdaEventTransformer<DynamoDBStreamEvent, DynamoDBRecord[]> {
  public transform(event: DynamoDBStreamEvent): DynamoDBRecord[] {
    return event.Records;
  }
}

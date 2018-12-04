import { Context } from 'aws-lambda';

export interface LambdaHandler<TEventData> {
  handleEvent(eventData: TEventData, context?: Context): Promise<any>;
}

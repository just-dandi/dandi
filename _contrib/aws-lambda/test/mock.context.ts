import { ClientContext, CognitoIdentity, Context } from 'aws-lambda';

export class MockContext implements Context {
  public awsRequestId: string;
  public callbackWaitsForEmptyEventLoop: boolean;
  public clientContext: ClientContext;
  public functionName: string;
  public functionVersion: string;
  public identity: CognitoIdentity;
  public invokedFunctionArn: string;
  public logGroupName: string;
  public logStreamName: string;
  public memoryLimitInMB: number;

  public done(error?: Error, result?: any): void {}

  public fail(error: Error | string): void {}

  public getRemainingTimeInMillis(): number {
    return 0;
  }

  public succeed(messageOrObject: any): void;
  public succeed(message: string, object: any): void;
  public succeed(messageOrObject: any | string, object?: any): void {}
}

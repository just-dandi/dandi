import { ClientContext, CognitoIdentity, Context } from 'aws-lambda';

export class MockContext implements Context {
    awsRequestId: string;
    callbackWaitsForEmptyEventLoop: boolean;
    clientContext: ClientContext;
    functionName: string;
    functionVersion: string;
    identity: CognitoIdentity;
    invokedFunctionArn: string;
    logGroupName: string;
    logStreamName: string;
    memoryLimitInMB: number;

    done(error?: Error, result?: any): void {
    }

    fail(error: Error | string): void {
    }

    getRemainingTimeInMillis(): number {
        return 0;
    }

    succeed(messageOrObject: any): void;
    succeed(message: string, object: any): void;
    succeed(messageOrObject: any | string, object?: any): void {
    }

}

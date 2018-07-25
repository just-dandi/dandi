# @dandi/aws-lambda

`@dandi/aws-lambda` provides helpers for using @dandi with the AWS
Lambda service.

## Concepts

Providing functionality for an AWS Lambda function is broken into
several chunks:

* `LambdaEventTransformer` - takes the raw AWS event and converts it
 into the desired format to be used by the `LambdaHandler`. Each type
 of Lambda event trigger will have its own implementation (e.g.
 `HttpEventTransformer`)
* `LambdaHandler` - Implemented by the consumer (developer), contains
 the business logic for receiving the transformed event data and doing
 any processing.
* `LambdaResponder` - takes the output of the `LambdaHandler` and
 converts it into the format expected by AWS Lambda. As with
 `LambdaEventTransformer`, each type of Lambda event has its own
 implementation (e.g. `HttpResponder`)

The transformer and responder implementations are grouped into modules
to make them easy to set up.

## Overview

There are 2 pieces of logic required to set up a Lambda function:

* Your handler implementation - an implementation of `LambdaHandler<TEventData>`
* A "main" file using the `Lambda` helper, which references your
 `LambdaHandler` implementation, as well as a module containing the
 `LambdaEventTransformer` and `LambdaResponder` implementations required
 for the type of events that will be handled.

## API Gateway/HTTP Events

`LambdaEventTransformer` and `LambdaResponder` implementations for
API Gateway proxied events are provided in the `AwsLambdaHttpModule`:

```typescript

// my-handler.ts
import { HttpHandlerRequest, LambdaHandler } from '@dandi/aws-lambda';
import { Context } from 'aws-lambda';

export class MyHandler implements LambdaHandler<HttpHandlerRequest> {
    public handleEvent(eventData: HttpHandlerRequest, context?: Context): Promise<any> {
        ...
    }

}

// main.ts
import { AwsLambdaHttpModule, Lambda } from '@dandi/aws-lambda';
import { MyHandler } from './my-handler';

export handler = Lambda.handler(MyHandler, AwsLambdaHttpModule);
```

### Interceptors

Implementations of `HttpResponseInterceptor` can be used to modify
 the response sent by the Lambda function. This can be used, for
 example, to add extra headers or modify the body or statusCode.
 Interceptors can be enabled by adding their classes to the
 `Lambda.handler()` call:

```typescript
// my-interceptor.ts
import { Injectable } from '@dandi/core';
import { HttpResponseInterceptor } from '@dandi/aws-lambda';
import { APIGatewayProxyResult } from 'aws-lambda';

@Injectable(HttpResponseInterceptor)
export class MyInterceptor implements HttpResponseInterceptor {
    public exec(response: APIGatewayProxyResult): void {
    }
}

// main.ts
import { AwsLambdaHttpModule, Lambda } from '@dandi/aws-lambda';
import { MyInterceptor } from './my-interceptor';
import { MyHandler } from './my-handler';

export handler = Lambda.handler(MyHandler, AwsLambdaHttpModule, MyInterceptor);
```

### Customizing Default Status Codes

By default, the `HttpResponder` will send a `200` status code for
successful requests, and `500` when an error is encountered.

The error code used can be easily changed by throwing errors that have
a `statusCode` property. If the `statusCode` property is present on an
error, that value will be used.

These defaults can be changed by specifying options for the
`AwsLambdaHttpModule`:

```typescript
// main.ts
import { AwsLambdaHttpModule, Lambda } from '@dandi/aws-lambda';
import { MyHandler } from './my-handler';

export handler = Lambda.handler(MyHandler, AwsLambdaHttpModule.configure({
    successStatusCode: 201,
    errorStatusCode: 418,
);
```

### Model Validation

`AwsLambdaHttpModule` can be configured to use model validation features
from `@dandi/model` and `@dandi/model-validation`:

```typescript
// my-model.ts
import { Property, Required } from '@dandi/model';

export class MyModel {
    @Property(String)
    @Required()
    public name: string;
}

// main.ts
import { AwsLambdaHttpModule, Lambda } from '@dandi/aws-lambda';
import { Validation } from '@dandi/model-validation';
import { MyHandler } from './my-handler';
import { MyModel } from './my-model';

export handler = Lambda.handler(MyHandler, Validation, AwsLambdaHttpModule.configure({
    validateBody: MyModel,
);
```

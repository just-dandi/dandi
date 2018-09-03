import { Inject, Injectable, Optional } from '@dandi/core';
import { ModelValidator } from '@dandi/model-validation';

import { APIGatewayEventRequestContext, APIGatewayProxyEvent, Context } from 'aws-lambda';

import { DandiAwsLambdaError } from './dandi.aws.lambda.error';
import { HttpEventOptions } from './http.event.options';
import { LambdaEventTransformer } from './lambda.event.transformer';

export interface HttpHandlerRequest {
  body: any;
  rawBody: string;
  event: APIGatewayProxyEvent;
  headers: { [name: string]: string };
  httpMethod: string;
  path: string;
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
  stageVariables: { [name: string]: string } | null;
  requestContext: APIGatewayEventRequestContext;
  resource: string;
  context: Context;
}

@Injectable(LambdaEventTransformer)
export class HttpEventTransformer implements LambdaEventTransformer<APIGatewayProxyEvent, HttpHandlerRequest> {
  constructor(
    @Inject(HttpEventOptions)
    @Optional()
    private options: HttpEventOptions,
    @Inject(ModelValidator)
    @Optional()
    private validator: ModelValidator,
  ) {}

  public transform(event: APIGatewayProxyEvent, context: Context): HttpHandlerRequest {
    let body: any;
    if (event.body) {
      let bodyStr = event.body;
      if (event.isBase64Encoded) {
        bodyStr = Buffer.from(bodyStr, 'base64').toString('utf-8');
      }
      body = JSON.parse(bodyStr);
    }

    if (this.options && this.options.validateBody) {
      if (!this.validator) {
        throw new DandiAwsLambdaError('validateBody option is set, but no ModelValidator is provided');
      }

      body = this.validator.validateModel(this.options.validateBody, body);
    }

    return {
      body,
      context,
      event,
      rawBody: event.body,
      headers: event.headers,
      httpMethod: event.httpMethod,
      path: event.path,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
      requestContext: event.requestContext,
      resource: event.resource,
      stageVariables: event.stageVariables,
    };
  }
}

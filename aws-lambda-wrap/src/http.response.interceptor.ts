import { InjectionToken } from '@dandi/core';

import { APIGatewayProxyResult } from 'aws-lambda';

import { localOpinionatedToken } from './local.token';

export interface HttpResponseInterceptor {
  exec(response: APIGatewayProxyResult): void;
}

export const HttpResponseInterceptor: InjectionToken<
  HttpResponseInterceptor
> = localOpinionatedToken('HttpResponseInterceptor', { multi: true });

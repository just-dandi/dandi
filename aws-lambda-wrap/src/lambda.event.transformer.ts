import { InjectionToken } from '@dandi/core';

import { Context } from 'aws-lambda';

import { localOpinionatedToken } from './local.token';

export interface LambdaEventTransformer<TEvent, TEventData> {
    transform(event: TEvent, context: Context): TEventData;
}

export const LambdaEventTransformer: InjectionToken<LambdaEventTransformer<any, any>> =
    localOpinionatedToken('LambdaEventTransformer', { multi: false });

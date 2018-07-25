import { InjectionToken } from '@dandi/di-core';

import { localOpinionatedToken } from './local.token';

export interface LambdaErrorHandler<TEvent> {
    handleError(event: TEvent, error: Error): void;
}

export const LambdaErrorHandler: InjectionToken<LambdaErrorHandler<any>> =
    localOpinionatedToken('LambdaErrorHandler', { multi: true });

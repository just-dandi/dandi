import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export interface LambdaResponder<TResponse> {
  handleResponse(response: TResponse): Promise<any>;
  handleError(error: Error): Promise<any>;
}

export const LambdaResponder: InjectionToken<LambdaResponder<any>> = localOpinionatedToken('LambdaResponder', {
  multi: false,
})

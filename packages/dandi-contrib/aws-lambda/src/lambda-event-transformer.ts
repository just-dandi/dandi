import { InjectionToken, Provider } from '@dandi/core'
import { Context } from 'aws-lambda'

import { localOpinionatedToken } from './local.token'

export interface LambdaEventTransformer<TEvent> {
  transform(event: TEvent, context: Context): Provider<any>[]
}

export const LambdaEventTransformer: InjectionToken<LambdaEventTransformer<
  any
>> = localOpinionatedToken('LambdaEventTransformer', { multi: false })

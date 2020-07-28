import { Provider } from '@dandi/core'
import { Context } from 'aws-lambda'

import { localToken } from './local-token'

export interface LambdaEventTransformer<TEvent> {
  transform(event: TEvent, context: Context): Provider<any>[]
}

export const LambdaEventTransformer = localToken.opinionated<LambdaEventTransformer<any>>(
  'LambdaEventTransformer',
  { multi: false },
)

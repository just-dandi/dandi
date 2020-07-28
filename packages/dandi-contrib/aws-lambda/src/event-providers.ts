import { Context } from 'aws-lambda'

import { localToken } from './local-token'

export const AwsContext = localToken.opinionated<Context>('AwsContext', {
  multi: false,
})

export const AwsEvent = localToken.opinionated<any>('AwsEvent', {
  multi: false,
})

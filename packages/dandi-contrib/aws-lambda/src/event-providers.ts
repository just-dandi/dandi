import { Context } from 'aws-lambda'

import { localOpinionatedToken } from './local.token'

export const AwsContext = localOpinionatedToken<Context>('AwsContext', {
  multi: false,
})

export const AwsEvent = localOpinionatedToken<any>('AwsEvent', {
  multi: false,
})

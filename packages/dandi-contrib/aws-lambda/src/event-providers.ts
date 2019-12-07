import { Context } from 'aws-lambda'

import { localOpinionatedToken } from './local.token'

export const AwsContext = localOpinionatedToken<Context>('AwsContext', {
  singleton: false,
  multi: false,
})

export const AwsEvent = localOpinionatedToken<any>('AwsEvent', {
  singleton: false,
  multi: false,
})

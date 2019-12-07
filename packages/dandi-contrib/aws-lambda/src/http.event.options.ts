import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken } from './local.token'

export interface HttpEventOptions {
  successStatusCode?: number
  errorStatusCode?: number
}

export const HttpEventOptions: InjectionToken<HttpEventOptions> = localOpinionatedToken('HttpEventOptions', {
  multi: false,
})

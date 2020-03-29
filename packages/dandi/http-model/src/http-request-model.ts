import { InjectionToken } from '@dandi/core'
import { HttpRequestHandlerScope } from '@dandi/http'

import { localToken } from './local-token'

export const HttpRequestModel: InjectionToken<any> = localToken.opinionated<any>('HttpRequestBody', {
  multi: false,
  restrictScope: HttpRequestHandlerScope,
})

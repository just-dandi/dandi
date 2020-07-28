import { ScopeBehavior } from '@dandi/core'

import { HttpRequestScope } from './http-request-scope'
import { localToken } from './local-token'

export const HttpRequestBodySource = localToken.opinionated<string | object>('HttpRequestBodySource', {
  multi: false,
  restrictScope: ScopeBehavior.perInjector(HttpRequestScope),
})

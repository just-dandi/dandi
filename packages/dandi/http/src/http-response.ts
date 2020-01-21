import { InjectionToken } from '@dandi/core'

import { HttpRequestScope } from './http-request-scope'
import { HttpStatusCode } from './http-status-code'
import { localOpinionatedToken } from './local-token'

export interface HttpResponse {
  cookie(name: string, value: string): this
  end(): void
  header(field: string, value?: string): this
  redirect(url: string): void
  send(body?: any): this
  status(code: HttpStatusCode): this
}

export const HttpResponse: InjectionToken<HttpResponse> = localOpinionatedToken<HttpResponse>('HttpResponse', {
  multi: false,
  restrictScope: HttpRequestScope,
})

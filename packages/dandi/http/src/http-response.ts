import { InjectionToken } from '@dandi/core'

import { HttpRequestScope } from './http-request-scope'
import { localOpinionatedToken } from './local-token'

export interface HttpResponse {
  cookie(name: string, value: string): this
  contentType(contentType: string): this
  end(): void
  header(field: string, value?: string): this
  json(body: any): this
  redirect(url: string): void
  send(body?: any): this
  set(field: string, value?: string): this
  setHeader(field: string, value?: string): this
  status(code: number): this
}

export const HttpResponse: InjectionToken<HttpResponse> = localOpinionatedToken<HttpResponse>('HttpResponse', {
  multi: false,
  restrictScope: HttpRequestScope,
})

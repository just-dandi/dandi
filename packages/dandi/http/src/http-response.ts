import { HttpRequestScope } from './http-request-scope'
import { HttpStatusCode } from './http-status-code'
import { localToken } from './local-token'

export interface HttpResponse {
  cookie(name: string, value: string): this
  end(): void
  header(field: string, value?: string): this
  redirect(url: string): void
  send(body?: any): this
  status(code: HttpStatusCode): this
}

export const HttpResponse = localToken.opinionated<HttpResponse>('HttpResponse', {
  multi: false,
  restrictScope: HttpRequestScope,
})

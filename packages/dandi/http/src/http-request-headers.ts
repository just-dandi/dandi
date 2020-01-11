import { Injectable, Inject, RestrictScope } from '@dandi/core'

import { HttpRequest } from './http-request'
import { HttpRequestScope } from './http-request-scope'

@Injectable(RestrictScope(HttpRequestScope))
export class HttpRequestHeaders {
  constructor(@Inject(HttpRequest) private request: HttpRequest) {}

  public get(headerName: string): string {
    return this.request.get(headerName.toLocaleLowerCase())
  }
}

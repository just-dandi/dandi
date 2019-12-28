import { Injectable, Inject } from '@dandi/core'

import { HttpRequest } from './http-request'

@Injectable()
export class HttpRequestHeaders {
  constructor(@Inject(HttpRequest) private request: HttpRequest) {}

  public get(headerName: string): string {
    return this.request.get(headerName.toLocaleLowerCase())
  }
}

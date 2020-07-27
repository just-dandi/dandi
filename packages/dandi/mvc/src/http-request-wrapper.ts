import { HttpMethod, HttpRequest } from '@dandi/http'

/**
 * @internal
 */
export class HttpRequestWrapper implements HttpRequest {
  public readonly body: any
  public readonly method: HttpMethod
  public readonly params: any
  public readonly path: string
  public readonly query: any
  public readonly get: (key: string) => any

  constructor(req: HttpRequest) {
    Object.assign(this, req)
    this.method = req.method.toUpperCase() as HttpMethod
    this.path = req.path // doesn't get assigned from Object.assign for some reason
    this.get = req.get.bind(req)
  }
}

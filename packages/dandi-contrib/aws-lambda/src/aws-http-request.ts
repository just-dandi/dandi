import { HttpMethod, HttpRequest } from '@dandi/http'

export class AwsHttpRequest implements HttpRequest {
  public readonly body: any
  public readonly method: HttpMethod
  public readonly params: any
  public readonly path: string
  public readonly query: any

  constructor(props: Omit<HttpRequest, 'get'>) {
    Object.assign(this, props)
  }

  public get(key: string): string {
    return (this.params || {})[key] || (this.query || {})[key]
  }
}

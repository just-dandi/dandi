import { MimeTypeInfo } from '@dandi/http'
import { HttpBodyParser } from '@dandi/http-pipeline'

export class PassThroughBodyParser implements HttpBodyParser {
  public readonly parseableTypes: MimeTypeInfo[] = []

  public parseBody(body: string | Buffer): string | object | Promise<object> {
    return body as any
  }

}

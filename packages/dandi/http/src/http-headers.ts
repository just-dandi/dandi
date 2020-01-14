import { HttpContentDisposition, HttpContentType, HttpHeader } from './http-header'
import { MimeTypeInfo } from './mime-type-info'

export interface HttpHeadersRaw {
  [name: string]: string
}

export interface HttpHeadersLoose {
  [name: string]: any
}

export interface HttpHeadersStrict {
  [HttpHeader.accept]?: MimeTypeInfo[]
  [HttpHeader.contentDisposition]?: HttpContentDisposition
  [HttpHeader.contentType]?: HttpContentType
}

export type HttpHeaders = HttpHeadersLoose & HttpHeadersStrict

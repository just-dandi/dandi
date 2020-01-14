import { MimeTypes } from '@dandi/http'

export enum HttpHeader {
  accept = 'accept',
  contentDisposition = 'content-disposition',
  contentType = 'content-type',
}

export const HttpHeaderLookup: { [key: string]: HttpHeader } =
  [...Object.entries(HttpHeader)].reduce((result, [key, value]) => {
    result[value] = key
    return result
  }, {})

export enum ContentDisposition {
  attachment = 'attachment',
  formData = 'form-data',
  inline = 'inline'
}

export interface HttpContentType {
  boundary?: string
  contentType: MimeTypes
  charset?: string
}

export interface HttpContentDisposition {
  contentDisposition: ContentDisposition
  name?: string
  filename?: string
  'filename*'?: string
}

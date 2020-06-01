export enum MimeType {
  any = '*/*',
  anyApplication = 'application/*',
  anyText = 'text/*',

  multipartFormData = 'multipart/form-data',
  applicationFormUrlencoded = 'application/x-www-form-urlencoded',
  applicationJson = 'application/json',
  applicationXml = 'application/xml',
  textHtml = 'text/html',
  textHtmlPartial = 'text/html-partial',
  textPlain = 'text/plain',

  unknown = '?/?',
}

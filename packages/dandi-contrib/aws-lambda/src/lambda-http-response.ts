import { Injectable } from '@dandi/core'
import { HttpHeader, HttpHeadersRaw, HttpResponse, HttpStatusCode } from '@dandi/http'

@Injectable(HttpResponse)
export class LambdaHttpResponse implements HttpResponse {

  public body: any
  public redirectUrl: string
  public statusCode: HttpStatusCode
  public get headers(): HttpHeadersRaw {
    return [...this.headerMap.entries()].reduce((headers, [field, value]) => {
      headers[field] = value
      return headers
    }, {})
  }

  public get cookies(): { [key: string]: string } {
    return [...this.cookieMap.entries()].reduce((cookies, [field, value]) => {
      cookies[field] = value
      return cookies
    }, {})
  }

  private readonly cookieMap = new Map<string, string>()
  private readonly headerMap = new Map<string, string>()

  public contentType(contentType: string): this {
    this.headerMap.set(HttpHeader.contentType, contentType)
    return this
  }

  public cookie(name: string, value: string): this {
    this.cookieMap.set(name, value)
    return this
  }

  public end(): void {
    // noop for Lambdas
  }

  public header(field: string, value?: string): this {
    this.headerMap.set(field, value)
    return this
  }

  public redirect(url: string): void {
    this.redirectUrl = url
  }

  public send(body?: any): this {
    this.body = body
    return this
  }

  public status(code: HttpStatusCode): this {
    this.statusCode = code
    return this
  }

}

import { Inject, Injectable, Logger, RestrictScope } from '@dandi/core'
import {
  HttpHeader,
  HttpMethod,
  HttpRequest,
  HttpRequestScope,
  HttpResponse,
  HttpStatusCode,
  MimeType,
} from '@dandi/http'

import { HttpPipelineTerminator } from './http-pipeline-terminator'
import { HttpPipelineRendererResult } from './rendering/http-pipeline-renderer'

/**
 * An implementation of {@link HttpPipelineTerminator} that terminates a request using the {@link HttpResponse} object.
 *
 * This is the default {@link HttpPipelineTerminator} implementation included with {@link HttpPipelineModule}
 */
@Injectable(HttpPipelineTerminator, RestrictScope(HttpRequestScope))
export class HttpResponsePipelineTerminator<TResponse = void> implements HttpPipelineTerminator {

  constructor(
    @Inject(HttpRequest) protected request: HttpRequest,
    @Inject(HttpResponse) protected response: HttpResponse,
    @Inject(Logger) protected logger: Logger,
  ) {}

  public async terminateResponse(renderResult: HttpPipelineRendererResult): Promise<TResponse> {
    if (renderResult.statusCode) {
      this.response.status(renderResult.statusCode)
    }
    if (renderResult.headers) {
      Object
        .keys(renderResult.headers)
        .forEach(headerName => this.response.header(headerName, renderResult.headers[headerName]))
    }
    this.response
      .header(HttpHeader.contentType, renderResult.contentType || MimeType.textPlain)
      .status(renderResult.statusCode || this.defaultStatusCode())
      .send(renderResult.renderedBody || '')
      .end()

    this.logger.debug(this.request.method, this.request.path, renderResult.statusCode || HttpStatusCode.ok)

    return
  }

  private defaultStatusCode(): HttpStatusCode {
    return this.request.method === HttpMethod.post ? HttpStatusCode.created : HttpStatusCode.ok
  }

}

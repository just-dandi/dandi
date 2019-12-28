import { Inject, Injectable, Logger } from '@dandi/core'
import { HttpRequest, HttpResponse, HttpStatusCode, MimeTypes } from '@dandi/http'

import { HttpPipelineRendererResult } from './rendering/http-pipeline-renderer'
import { HttpPipelineTerminator } from './http-pipeline-terminator'

/**
 * An implementation of {@link HttpPipelineTerminator} that terminates a request using the {@link HttpResponse} object.
 *
 * This is the default {@link HttpPipelineTerminator} implementation included with {@link HttpPipelineModule}
 */
@Injectable(HttpPipelineTerminator)
export class HttpResponsePipelineTerminator implements HttpPipelineTerminator {

  constructor(
    @Inject(HttpRequest) private request: HttpRequest,
    @Inject(HttpResponse) private response: HttpResponse,
    @Inject(Logger) private logger: Logger,
  ) {}

  public async terminateResponse(renderResult: HttpPipelineRendererResult): Promise<void> {
    if (renderResult.statusCode) {
      this.response.status(renderResult.statusCode)
    }
    if (renderResult.headers) {
      Object
        .keys(renderResult.headers)
        .forEach(headerName => this.response.setHeader(headerName, renderResult.headers[headerName]))
    }
    this.response
      .contentType(renderResult.contentType || MimeTypes.textPlain)
      .send(renderResult.renderedBody || '')
      .end()

    this.logger.debug(this.request.method, this.request.path, renderResult.statusCode || HttpStatusCode.ok)
  }

}

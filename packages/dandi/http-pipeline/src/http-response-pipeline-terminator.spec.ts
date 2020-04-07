import { Logger, NoopLogger } from '@dandi/core'
import { HttpHeader, HttpMethod, HttpRequest, HttpResponse, HttpStatusCode, MimeType } from '@dandi/http'
import { HttpPipelineRendererResult, HttpResponsePipelineTerminator } from '@dandi/http-pipeline'
import { httpResponseFixture } from '@dandi/http/testing'

import { expect } from 'chai'

describe('HttpResponsePipelineTerminator', () => {

  let request: HttpRequest
  let response: HttpResponse
  let logger: Logger
  let classUnderTest: HttpResponsePipelineTerminator
  let renderResult: HttpPipelineRendererResult

  beforeEach(() => {
    request = {
      method: HttpMethod.get,
      path: '/test',
    } as HttpRequest
    response = httpResponseFixture()
    logger = new NoopLogger()
    classUnderTest = new HttpResponsePipelineTerminator(request, response, logger)
    renderResult = {
      contentType: MimeType.textPlain,
      headers: {},
      renderedBody: 'foo',
    }
  })
  afterEach(() => {
    request = undefined
    response = undefined
    logger = undefined
    classUnderTest = undefined
    renderResult = undefined
  })

  describe('terminateResponse', () => {
    it('sets a default code of 200 OK if no status code is specified', async () => {
      await classUnderTest.terminateResponse(renderResult)

      expect(response.status).to.have.been.calledWith(HttpStatusCode.ok)
    })

    it('sets a status code if one is specified', async () => {
      renderResult.statusCode = HttpStatusCode.ok
      await classUnderTest.terminateResponse(renderResult)

      expect(response.status).to.have.been.calledWithExactly(HttpStatusCode.ok)
    })

    it('does not set additional headers if none are specified', async () => {
      await classUnderTest.terminateResponse(renderResult)

      expect(response.header).to.have.been.calledOnceWithExactly(HttpHeader.contentType, MimeType.textPlain)
    })

    it('sets headers if any are specified', async () => {
      renderResult.headers = {
        [HttpHeader.wwwAuthenticate]: 'Bearer',
        [HttpHeader.xPoweredBy]: 'Joe Llama',
      }
      await classUnderTest.terminateResponse(renderResult)

      expect(response.header).to.have.been
        .calledThrice
        .calledWithExactly(HttpHeader.wwwAuthenticate, 'Bearer')
        .calledWithExactly(HttpHeader.xPoweredBy, 'Joe Llama')
        .calledWithExactly(HttpHeader.contentType, MimeType.textPlain)
    })
  })

})

import { HttpResponse, HttpStatusCode, MimeTypes } from '@dandi/http'
import { HttpPipelineRendererResult, HttpResponsePipelineTerminator } from '@dandi/http-pipeline'
import { httpResponseFixture } from '@dandi/http/testing'
import { expect } from 'chai'

describe('HttpResponsePipelineTerminator', () => {

  let response: HttpResponse
  let classUnderTest: HttpResponsePipelineTerminator
  let renderResult: HttpPipelineRendererResult

  beforeEach(() => {
    response = httpResponseFixture()
    classUnderTest = new HttpResponsePipelineTerminator(response)
    renderResult = {
      contentType: MimeTypes.textPlain,
      headers: {},
      renderedBody: 'foo',
    }
  })
  afterEach(() => {
    response = undefined
    classUnderTest = undefined
    renderResult = undefined
  })

  describe('terminateResponse', () => {
    it('does not set a status code if none is specified', async () => {
      await classUnderTest.terminateResponse(renderResult)

      expect(response.status).not.to.have.been.called
    })

    it('sets a status code if one is specified', async () => {
      renderResult.statusCode = HttpStatusCode.ok
      await classUnderTest.terminateResponse(renderResult)

      expect(response.status).to.have.been.calledWithExactly(HttpStatusCode.ok)
    })

    it('does not set headers if none are specified', async () => {
      await classUnderTest.terminateResponse(renderResult)

      expect(response.setHeader).not.to.have.been.called
    })

    it('sets headers if any are specified', async () => {
      renderResult.headers = {
        'WWW-Authenticate': 'Bearer',
        'X-Served-By': 'Joe Llama',
      }
      await classUnderTest.terminateResponse(renderResult)

      expect(response.setHeader).to.have.been
        .calledTwice
        .calledWithExactly('WWW-Authenticate', 'Bearer')
        .calledWithExactly('X-Served-By', 'Joe Llama')
    })
  })

})

import { HttpStatusCode } from '@dandi/http'
import { DefaultHttpPipelineErrorHandler, HttpPipelineErrorResult } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('DefaultHttpPipelineErrorHandler', () => {

  let classUnderTest: DefaultHttpPipelineErrorHandler
  let initialResult: HttpPipelineErrorResult

  beforeEach(() => {
    classUnderTest = new DefaultHttpPipelineErrorHandler()
    initialResult = {
      errors: [new Error('Your llamas is lloose!')],
    }
  })
  afterEach(() => {
    classUnderTest = undefined
    initialResult = undefined
  })

  describe('handleError', () => {
    it('defaults to using 500/Internal Server Error if the first error provides no status code', async () => {
      const handledResult = await classUnderTest.handleError(initialResult)

      expect(handledResult.statusCode).to.equal(HttpStatusCode.internalServerError)
    })

    it('uses the status code from the first error', async () => {
      (initialResult.errors[0] as any).statusCode = HttpStatusCode.teapot
      const handledResult = await classUnderTest.handleError(initialResult)

      expect(handledResult.statusCode).to.equal(HttpStatusCode.teapot)
    })

    it('does not create a circular structure', async () => {
      const handledResult = await classUnderTest.handleError(initialResult)

      expect(handledResult.data.result).not.to.equal(handledResult)
    })
  })

})

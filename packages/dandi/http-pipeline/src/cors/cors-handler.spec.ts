import { testHarness } from '@dandi/core/testing'
import {
  CorsHandler,
  CorsHeaderValues,
  HttpPipelineResult,
  isHttpPipelineVoidResult,
} from '@dandi/http-pipeline'
import { HttpHeader, HttpMethod } from '@dandi/http'

import { expect } from 'chai'

describe('CorsHandler', () => {

  const harness = testHarness(CorsHandler, {
    provide: CorsHeaderValues,
    useFactory: () => corsHeaderValues,
  })

  let corsHeaderValues: CorsHeaderValues
  let corsHandler: CorsHandler

  beforeEach(async () => {
    corsHandler = await harness.inject(CorsHandler)
  })

  it('resolves with a HttpPipelineVoidResult that includes the headers from CorsHeaderValues', async () => {

    corsHeaderValues = new CorsHeaderValues(
      'some-origin.com',
      [HttpMethod.get, HttpMethod.post],
      true,
      [HttpHeader.contentType, HttpHeader.contentLanguage],
      [HttpHeader.contentType, HttpHeader.contentLanguage],
      2,
    )
    const result: HttpPipelineResult = await harness.invoke(corsHandler, 'handleOptionsRequest')

    expect(isHttpPipelineVoidResult(result)).to.be.true
    expect(result.headers).to.include(corsHeaderValues)

  })

})

import { stub, testHarness, TestInjector } from '@dandi/core/testing'
import { CorsHeaderValues, CorsTransformer, HttpPipelineResult } from '@dandi/http-pipeline'
import { SinonStubbedInstance } from 'sinon'
import { createHttpRequestScope, HttpHeader, HttpMethod, HttpRequest, MimeType } from '@dandi/http'

import { expect } from 'chai'

describe('CorsTransformer', () => {

  const harness = testHarness(CorsTransformer,
    {
      provide: CorsHeaderValues,
      useFactory: () => corsHeaders,
    },
    {
      provide: HttpRequest,
      useFactory: () => req,
    },
  )

  let corsHeaders: CorsHeaderValues
  let req: SinonStubbedInstance<HttpRequest>
  let injector: TestInjector
  let result: HttpPipelineResult
  let transformer: CorsTransformer

  beforeEach(async () => {
    corsHeaders = {
      [HttpHeader.accessControlAllowOrigin]: 'some-origin.com',
      [HttpHeader.accessControlAllowMethods]: HttpMethod.post,
    }
    req = {
      get: stub(),
    } as SinonStubbedInstance<HttpRequest>
    injector = harness.createChild(createHttpRequestScope(req))
    transformer = await injector.inject(CorsTransformer)
    result = {
      headers: {
        [HttpHeader.contentType]: MimeType.applicationJson,
      },
      data: { foo: 'bar' },
    }
  })
  afterEach(() => {
    corsHeaders = undefined
    req = undefined
    injector = undefined
    result = undefined
    transformer = undefined
  })

  describe('transform', () => {

    describe('when the request is a CORS request', () => {

      beforeEach(() => {
        req.get.withArgs(HttpHeader.origin).returns('http://some-origin.com')
        req.get.withArgs(HttpHeader.host).returns('another-origin.com')
      })

      it('merges any CORS headers with the existing headers on the pipeline result', async () => {
        const transformedResult = await transformer.transform(result)
        const resultWithoutHeaders = Object.assign({}, result) as any
        delete resultWithoutHeaders.headers

        expect(transformedResult).not.to.equal(result)
        expect(transformedResult).to.include(resultWithoutHeaders)
        expect(transformedResult.headers).to.include(result.headers)
        expect(transformedResult.headers).to.include(corsHeaders)
      })

    })

    describe('when the request is not a CORS request', () => {

      beforeEach(() => {
        req.get.withArgs(HttpHeader.origin).returns('http://some-origin.com')
        req.get.withArgs(HttpHeader.host).returns('some-origin.com')
      })

      it('passes the pipeline result through without merging any CORS headers', async () => {
        const transformedResult = await transformer.transform(result)

        expect(transformedResult).to.equal(result)
        expect(transformedResult.headers).not.to.include(corsHeaders)
      })

    })

  })

})

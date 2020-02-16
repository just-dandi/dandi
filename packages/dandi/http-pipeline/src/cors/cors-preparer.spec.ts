import { testHarness, stub, TestInjector } from '@dandi/core/testing'
import { createHttpRequestScope, HttpHeader, HttpRequest } from '@dandi/http'
import {
  CorsAllowRequest,
  CorsHeaderValues,
  CorsPreparer,
  corsRequestAllowed,
} from '@dandi/http-pipeline'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

describe('CorsPreparer', () => {

  const harness = testHarness(CorsPreparer, {
    provide: CorsHeaderValues,
    useFactory: () => corsHeaders,
  })

  let corsHeaders: CorsHeaderValues
  let req: SinonStubbedInstance<HttpRequest>
  let injector: TestInjector
  let preparer: CorsPreparer

  beforeEach(async () => {
    corsHeaders = {}
    req = {
      get: stub(),
    } as SinonStubbedInstance<HttpRequest>
    injector = harness.createChild(createHttpRequestScope(req))
    preparer = await injector.inject(CorsPreparer)
  })
  afterEach(() => {
    corsHeaders = undefined
    req = undefined
    injector = undefined
    preparer = undefined
  })

  describe('prepare', () => {

    it('returns a CorsAllowRequest factory provider that determines whether the request will be allowed by CORS rules if ' +
      'the request is a CORS request', async () => {
      req.get.withArgs(HttpHeader.origin).returns('http://some-origin.com')
      req.get.withArgs(HttpHeader.host).returns('another-origin.com')

      const providers = await preparer.prepare(req)
      const allowRequestProvider = providers.find(p => p.provide === CorsAllowRequest)

      expect(allowRequestProvider).to.exist
      expect(allowRequestProvider).to.include({ provide: CorsAllowRequest, useFactory: corsRequestAllowed })
    })

    it('returns a CorsAllowRequest value provider that allows the request if the request is not a CORS request', async () => {
      req.get.withArgs(HttpHeader.origin).returns('http://some-origin.com')
      req.get.withArgs(HttpHeader.host).returns('some-origin.com')

      const providers = await preparer.prepare(req)
      const allowRequestProvider = providers.find(p => p.provide === CorsAllowRequest)

      expect(allowRequestProvider).to.exist
      expect(allowRequestProvider).to.include({ provide: CorsAllowRequest, useValue: true })
    })

  })

})

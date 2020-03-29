import { testHarness, TestInjector } from '@dandi/core/testing'
import {
  HttpHeader,
  HttpHeaderWildcard,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
} from '@dandi/http'
import {
  CorsAllowOrigin,
  CorsOriginWhitelist,
  CorsOriginWhitelistProvider,
} from '@dandi/http-pipeline'
import { createTestHttpRequestScope } from '@dandi/http/testing'

import { expect } from 'chai'

describe('CorsOriginWhitelistProvider', () => {

  const harness = testHarness(CorsOriginWhitelistProvider,
    {
      provide: CorsOriginWhitelist,
      useFactory: () => whitelist,
    },
    {
      provide: HttpRequestHeadersAccessor,
      useFactory: () => headers,
    },
  )

  let origin: string
  let whitelist: CorsOriginWhitelist
  let headers: HttpRequestHeadersAccessor
  let injector: TestInjector

  beforeEach(() => {
    origin = 'some-origin.com'
    headers = HttpRequestHeadersHashAccessor.fromRaw({
      [HttpHeader.origin]: origin,
    })
    injector = harness.createChild(createTestHttpRequestScope())
  })
  afterEach(() => {
    origin = undefined
    whitelist = undefined
    headers = undefined
    injector = undefined
  })

  describe('when the whitelist is a wildcard (*)', () => {

    beforeEach(() => {
      whitelist = HttpHeaderWildcard
    })

    it('provides the request origin', async () => {
      expect(await injector.inject(CorsAllowOrigin)).to.equal(origin)
    })

  })

  describe('when the whitelist is a string', () => {

    it('provides the request origin when the whitelist matches it exactly', async () => {
      whitelist = origin

      expect(await injector.inject(CorsAllowOrigin)).to.equal(origin)
    })

    it('provides undefined when the whitelist does not match the origin', async () => {
      whitelist = 'another-origin.com'

      expect(await injector.inject(CorsAllowOrigin)).to.be.undefined
    })

  })

  describe('when the whitelist is a regexp pattern', () => {

    it('provides the request origin when it successfully tests against the whitelist ', async () => {
      whitelist = /(some|another)-origin\.com$/

      expect(await injector.inject(CorsAllowOrigin)).to.equal(origin)
    })

    it('provides undefined when the whitelist does not match the origin', async () => {
      whitelist = /some-origin\.org$/

      expect(await injector.inject(CorsAllowOrigin)).to.be.undefined
    })
  })

  describe('when the whitelist is an array', () => {

    it('provides the request origin when it matches or tests against at least one of the whitelist entries', async () => {
      whitelist = [
        'some-origin.com',
        /some-origin\.org$/,
      ]

      expect(await injector.inject(CorsAllowOrigin)).to.equal(origin)
    })

    it('provides undefined when the request origin does not match or tests against any of the whitelist entries', async () => {
      whitelist = [
        'another-origin.com',
        /some-origin\.org$/,
      ]

      expect(await injector.inject(CorsAllowOrigin)).to.be.undefined
    })

  })

})

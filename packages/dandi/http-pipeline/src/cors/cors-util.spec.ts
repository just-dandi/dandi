import { createStubInstance, stub } from '@dandi/core/testing'
import {
  HttpHeader,
  HttpMethod,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
} from '@dandi/http'
import { corsRequestAllowed, CorsResponseHeaders, isCorsRequest } from '@dandi/http-pipeline'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

describe('corsRequestAllowed', () => {
  let headersStub: SinonStubbedInstance<HttpRequestHeadersAccessor>
  let headers: HttpRequestHeadersAccessor

  beforeEach(() => {
    headersStub = createStubInstance(HttpRequestHeadersHashAccessor)
    headers = headersStub as HttpRequestHeadersAccessor
  })
  afterEach(() => {
    headersStub = undefined
    headers = undefined
  })

  it('returns false if the Access-Control-Allow-Origin response header is empty', () => {
    expect(corsRequestAllowed({ [HttpHeader.accessControlAllowMethods]: 'GET' }, headers)).to.be.false
  })

  it('returns false if the Access-Control-Allow-Methods response header is empty', () => {
    expect(corsRequestAllowed({ [HttpHeader.accessControlAllowOrigin]: 'foo.com' }, headers)).to.be.false
  })

  it(
    'returns false if not all of the headers in the Access-Control-Request-Headers request header are included in the' +
      'Access-Control-Allow-Headers response header',
    () => {
      headersStub.get.withArgs(HttpHeader.accessControlRequestHeaders).returns([HttpHeader.contentType])
      const corsHeaders: Partial<CorsResponseHeaders> = {
        [HttpHeader.accessControlAllowHeaders]: `${HttpHeader.contentLanguage} ${HttpHeader.cacheControl}`,
      }
      headersStub.get.withArgs(HttpHeader.accessControlRequestHeaders).returns([HttpHeader.contentType])

      expect(corsRequestAllowed(corsHeaders, headers)).to.be.false
    },
  )

  it(
    'returns true if the Access-Control-Allow-Origin and Access-Control-Allow-Methods response headers both have' +
      'values, and the Access-Control-Request-Headers request header is not specified',
    () => {
      const corsHeaders: Partial<CorsResponseHeaders> = {
        [HttpHeader.accessControlAllowOrigin]: 'foo.com',
        [HttpHeader.accessControlAllowMethods]: HttpMethod.get,
      }

      expect(corsRequestAllowed(corsHeaders, headers)).to.be.true
    },
  )

  it(
    'returns true if the Access-Control-Allow-Origin and Access-Control-Allow-Methods response headers both have' +
      'values, and the Access-Control-Allow-Headers response header includes all requested headers from the ' +
      'Access-Control-Request-Headers request header',
    () => {
      const corsHeaders: Partial<CorsResponseHeaders> = {
        [HttpHeader.accessControlAllowOrigin]: 'foo.com',
        [HttpHeader.accessControlAllowMethods]: HttpMethod.get,
        [HttpHeader.accessControlAllowHeaders]: `${HttpHeader.contentType} ${HttpHeader.cacheControl}`,
      }
      headersStub.get
        .withArgs(HttpHeader.accessControlRequestHeaders)
        .returns([HttpHeader.contentType, HttpHeader.cacheControl])

      expect(corsRequestAllowed(corsHeaders, headers)).to.be.true
    },
  )

  it(
    'returns false if the Access-Control-Allow-Origin and Access-Control-Allow-Methods response headers both have' +
      'values, but the Access-Control-Allow-Headers response header does not include all requested headers from the ' +
      'Access-Control-Request-Headers request header',
    () => {
      const corsHeaders: Partial<CorsResponseHeaders> = {
        [HttpHeader.accessControlAllowOrigin]: 'foo.com',
        [HttpHeader.accessControlAllowMethods]: HttpMethod.get,
        [HttpHeader.accessControlAllowHeaders]: `${HttpHeader.contentType}`,
      }
      headersStub.get
        .withArgs(HttpHeader.accessControlRequestHeaders)
        .returns([HttpHeader.contentType, HttpHeader.cacheControl])

      expect(corsRequestAllowed(corsHeaders, headers)).to.be.false
    },
  )
})

describe('isCorsRequest', () => {
  let req: SinonStubbedInstance<HttpRequest>

  beforeEach(() => {
    req = {
      get: stub(),
    } as SinonStubbedInstance<HttpRequest>
  })
  afterEach(() => {
    req = undefined
  })

  it('returns false if there is no origin request header', () => {
    expect(isCorsRequest(req)).to.be.false
  })

  it('returns false if the origin matches the host', () => {
    req.get.withArgs(HttpHeader.origin).returns('http://foo.com').withArgs(HttpHeader.host).returns('foo.com')

    expect(isCorsRequest(req)).to.be.false
  })

  it('returns false if the origin does not match the host', () => {
    req.get.withArgs(HttpHeader.origin).returns('http://foo.com').withArgs(HttpHeader.host).returns('bar.com')

    expect(isCorsRequest(req)).to.be.true
  })
})

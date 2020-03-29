import { OpinionatedToken } from '@dandi/core'
import { getInjectableParamMetadata, methodTarget, ParamMetadata } from '@dandi/core/internal/util'
import { testHarness } from '@dandi/core/testing'
import {
  HttpHeader,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
  MimeType,
  requestHeaderToken,
} from '@dandi/http'
import { createTestHttpRequestScope } from '@dandi/http/testing'

import { expect } from 'chai'

import { RequestHeader } from './request-header.decorator'

describe('@RequestHeader', () => {
  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testHeader(@RequestHeader(HttpHeader.contentType) contentType: any): any {}
  }

  const harness = testHarness()

  let meta: ParamMetadata<any>

  beforeEach(() => {
    meta = getInjectableParamMetadata(methodTarget(TestController), 'testHeader', 0)
  })
  afterEach(() => {
    meta = undefined
  })

  it('sets a token for the specified header', async () => {
    expect(meta).to.exist
    expect(meta.token).to.exist
    expect(meta.token).to.be.instanceOf(OpinionatedToken)
    expect(meta.token).to.equal(requestHeaderToken(HttpHeader.contentType))
  })

  it('creates a provider to handle injecting the header value', async () => {

    harness.register(...meta.providers, {
      provide: HttpRequestHeadersAccessor,
      useValue: HttpRequestHeadersHashAccessor.fromRaw({
        [HttpHeader.contentType]: MimeType.applicationJson,
      }),
    })
    const injector = harness.createChild(createTestHttpRequestScope())

    expect(await injector.inject(requestHeaderToken(HttpHeader.contentType))).to.deep.equal({ contentType: MimeType.applicationJson })

  })

})

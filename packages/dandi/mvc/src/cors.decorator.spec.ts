import { HttpHeader } from '@dandi/http'
import { Controller, HttpGet, getCorsConfig, Cors, getControllerMetadata } from '@dandi/mvc'

import { expect } from 'chai'

describe('@Cors', () => {
  describe('as a class decorator', () => {
    it('sets a cors config on the decorated class', () => {
      @Controller('/cors-decorator-test')
      @Cors()
      class TestController {
        @HttpGet('/class-decorator')
        public testMethod(): void {}
      }

      const controllerMeta = getControllerMetadata(TestController)
      expect(controllerMeta.cors).to.exist
    })
  })

  describe('as a method decorator', () => {
    it('sets a cors config on the decorated method', () => {
      @Controller('/cors-decorator-test')
      class TestController {
        @HttpGet('/method-decorator')
        @Cors()
        public testMethod(): void {}
      }

      const controllerMeta = getControllerMetadata(TestController)
      const methodMeta = controllerMeta.routeMap.get('testMethod')

      expect(methodMeta).to.exist
      expect(methodMeta.cors).to.exist
    })
  })
})

describe('getCorsConfig', () => {
  it('returns the methodCors if controllerCors is falsy', () => {
    const controllerCors = undefined
    const methodCors = {}

    expect(getCorsConfig(controllerCors, methodCors)).to.equal(methodCors)
  })

  it('returns the controllerCors if the methodCors is undefined', () => {
    const controllerCors = {}
    const methodCors = undefined

    expect(getCorsConfig(controllerCors, methodCors)).to.equal(controllerCors)
  })

  it('returns true if both the controller and method cors were set to true', () => {
    expect(getCorsConfig(true, true)).to.be.true
  })

  it('merges the configs if both controller and method cors are truthy', () => {
    const config = getCorsConfig(
      { allowHeaders: [HttpHeader.contentType] },
      { exposeHeaders: [HttpHeader.cacheControl] },
    )
    expect(config).to.deep.equal({
      allowHeaders: [HttpHeader.contentType],
      exposeHeaders: [HttpHeader.cacheControl],
    })
  })
})

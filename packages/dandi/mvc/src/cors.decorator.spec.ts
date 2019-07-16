import { Controller, HttpGet, getCorsConfig } from '@dandi/mvc'
import { expect } from 'chai'

import { getControllerMetadata } from './controller.metadata'
import { Cors } from './cors.decorator'

describe('@Cors', () => {
  describe('as a class decorator', () => {
    it('sets a cors config on the decorated class', () => {
      @Controller('/')
      @Cors()
      class TestController {
        @HttpGet()
        public testMethod(): void {}
      }

      const controllerMeta = getControllerMetadata(TestController)
      expect(controllerMeta.cors).to.exist
    })
  })

  describe('as a method decorator', () => {
    it('sets a cors config on the decorated method', () => {
      @Controller('/')
      class TestController {
        @HttpGet()
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
    expect(getCorsConfig({ allowedHeaders: ['bar'] }, { exposedHeaders: ['foo'] })).to.deep.equal({
      allowedHeaders: ['bar'],
      exposedHeaders: ['foo'],
    })
  })
})

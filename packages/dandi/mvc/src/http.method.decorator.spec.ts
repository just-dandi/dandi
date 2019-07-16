import { expect } from 'chai'

import { Controller, HttpGet, HttpMethod, HttpPost } from '../'

import { getControllerMetadata } from './controller.metadata'

describe('HttpMethodDecorator', () => {
  it('adds a route entry for the decorated method', () => {
    @Controller('/')
    class TestController {
      @HttpGet()
      public testMethod(): void {}
    }

    const controllerMeta = getControllerMetadata(TestController)
    const methodMeta = controllerMeta.routeMap.get('testMethod')

    expect(methodMeta).to.exist
    expect(methodMeta.routePaths).to.include.keys('')
    expect(methodMeta.routePaths.get('')).to.include(HttpMethod.get)
  })

  it('adds route entries for multiple decorations', () => {
    @Controller('/')
    class TestController {
      @HttpGet()
      @HttpPost()
      @HttpPost('foo')
      public testMethod(): void {}
    }

    const controllerMeta = getControllerMetadata(TestController)
    const methodMeta = controllerMeta.routeMap.get('testMethod')

    expect(methodMeta).to.exist
    expect(methodMeta.routePaths).to.include.keys('', 'foo')
    expect(methodMeta.routePaths.get('')).to.include(HttpMethod.get)
    expect(methodMeta.routePaths.get('')).to.include(HttpMethod.post)
    expect(methodMeta.routePaths.get('foo')).to.include(HttpMethod.post)
  })
})

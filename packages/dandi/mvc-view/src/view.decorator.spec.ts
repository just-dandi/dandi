import { MimeType } from '@dandi/http'
import { ControllerMetadata, getControllerMetadata } from '@dandi/mvc'
import { ControllerViewMethodMetadata, View } from '@dandi/mvc-view'

import { expect } from 'chai'

describe('@View', () => {
  const options = { xml: false }
  class TestController {
    @View()
    test(): any {}

    @View('test-named', MimeType.textHtml)
    testNamed(): any {}

    @View({ name: 'test-config', options })
    testConfig(): any {}
  }

  let meta: ControllerMetadata

  function getMethodMeta(methodName: string): ControllerViewMethodMetadata {
    return meta.routeMap.get(methodName)
  }

  beforeEach(() => {
    meta = getControllerMetadata(TestController)
  })
  afterEach(() => {
    meta = undefined
  })

  it('updates the controller method metadata with view metadata', () => {
    const methodMeta = getMethodMeta('test')
    expect(methodMeta.views).to.exist
  })

  it('sets the context as the directory of the file containing the decorated method', () => {
    const methodMeta = getMethodMeta('test')
    expect(methodMeta.views[0].context).to.equal(__dirname)
  })

  it('includes the name and any specified filters', () => {
    const methodMeta = getMethodMeta('testNamed')
    expect(methodMeta.views[0].name).to.equal('test-named')
    expect(methodMeta.views[0].filter).to.deep.equal([MimeType.textHtml])
  })

  it('includes the name and any specified options', () => {
    const methodMeta = getMethodMeta('testConfig')
    expect(methodMeta.views[0].name).to.equal('test-config')
    expect(methodMeta.views[0].options).to.deep.equal({ viewEngineOptions: options })
  })
})

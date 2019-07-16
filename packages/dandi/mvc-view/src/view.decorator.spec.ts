import { getControllerMetadata } from '@dandi/mvc'
import { View } from '@dandi/mvc-view'
import { expect } from 'chai'

describe('@View', function() {
  const options = {}
  class TestController {
    @View()
    test(): any {}

    @View('test-named', options)
    testNamed(): any {}
  }

  beforeEach(function() {
    this.meta = getControllerMetadata(TestController)
  })

  it('updates the controller method metadata with view metadata', function() {
    expect(this.meta.routeMap.get('test').view).to.exist
  })

  it('sets the context as the directory of the file containing the decorated method', function() {
    expect(this.meta.routeMap.get('test').view.context).to.equal(__dirname)
  })

  it('includes the name and any specified options', function() {
    expect(this.meta.routeMap.get('testNamed').view.name).to.equal('test-named')
    expect(this.meta.routeMap.get('testNamed').view.options).to.deep.equal({ viewEngineOptions: options })
  })
})

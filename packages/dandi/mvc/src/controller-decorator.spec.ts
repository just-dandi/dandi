import { Repository } from '@dandi/core/internal'
import { INJECTABLE_REGISTRATION_DATA } from '@dandi/core/internal/util'
import { Controller, getControllerMetadata, MissingControllerPathError } from '@dandi/mvc'

import { CONTROLLER_REGISTRATION_SOURCE } from '@dandi/mvc/src/controller-decorator'

import { expect } from 'chai'
import { SinonSpy, spy } from 'sinon'

describe('@Controller', () => {
  let controllerRegister: SinonSpy
  beforeEach(() => {
    controllerRegister = spy(Repository.for(Controller), 'register')
  })
  afterEach(() => {
    controllerRegister.restore()
    controllerRegister = undefined
  })

  it('registers the class as an Injectable', () => {
    class TestClass {}

    Controller('/test')(TestClass)

    expect(INJECTABLE_REGISTRATION_DATA.find(({ target }) => target === TestClass)).to.exist
  })

  it('registers the class in the Controller repository', () => {
    class TestClass {}

    Controller('/test')(TestClass)

    expect(controllerRegister).to.have.been.calledOnce
    expect(controllerRegister).to.have.been.calledWith(CONTROLLER_REGISTRATION_SOURCE, TestClass)
  })

  it('sets the path on the controller metadata', () => {
    class TestClass {}
    class TestClassOptions {}

    Controller('/test')(TestClass)
    Controller({ path: '/test' })(TestClassOptions)

    expect(getControllerMetadata(TestClass).path).to.equal('/test')
    expect(getControllerMetadata(TestClassOptions).path).to.equal('/test')
  })

  it('throws an error if the path is null or undefined', () => {
    class TestClass {}

    expect(() => Controller(null)(TestClass)).to.throw(MissingControllerPathError)
    expect(() => Controller(undefined)(TestClass)).to.throw(MissingControllerPathError)
    expect(() => Controller({ path: null })(TestClass)).to.throw(MissingControllerPathError)
    expect(() => Controller({ path: undefined })(TestClass)).to.throw(MissingControllerPathError)
  })
})

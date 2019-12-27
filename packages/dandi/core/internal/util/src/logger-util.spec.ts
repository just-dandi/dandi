import { createLoggerMethodChain, MODIFIER_KEYS } from '@dandi/core/internal'

import { stub } from 'sinon'
import { expect } from 'chai'

describe('createLoggerMethodChain', function() {

  beforeEach(function() {
    this.stub = stub()
    this.log = createLoggerMethodChain(this.stub)
  })

  it('defines getters for each of the defined modifiers', function() {
    MODIFIER_KEYS.forEach(key => expect(this.log[key], key).to.exist)
  })

  it('passes the original method through', function() {

    this.log('foo')
    expect(this.stub).to.have.been
      .calledOnce
      .calledWithExactly({}, 'foo')

  })

  it('applies modifiers to the options as they are called', function() {

    this.log.noContext('foo')
    expect(this.stub).to.have.been
      .calledOnce
      .calledWithExactly({ context: false }, 'foo')

  })

  it('overwrites opposing modifiers', function() {
    this.log.noContext.context('foo')
    expect(this.stub).to.have.been
      .calledOnce
      .calledWithExactly({ context: true }, 'foo')
  })

  it('disables all tags with the noTag modified', function() {
    this.log.noTags('foo')
    expect(this.stub).to.have.been
      .calledOnce
      .calledWithExactly({ context: false, level: false, timestamp: false }, 'foo')
  })

})

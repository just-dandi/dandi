import { MODIFIER_KEYS } from '@dandi/core/internal/util'
import { LoggerFixture } from '@dandi/core/testing'
import { expect } from 'chai'

describe('LoggerFixture', function () {

  beforeEach(function() {
    this.fixture = new LoggerFixture()
  })

  it('defines getters for each of the defined modifiers', function() {
    MODIFIER_KEYS.forEach(key => expect(this.fixture.info[key], key).to.exist)
  })

  it('allows testing calls of the root logger method', function() {
    this.fixture.info('foo')

    expect(this.fixture.info).to.have.been
      .calledOnce
      .calledWithExactly('foo')
  })

  it('allows separately testing calls to chained logger methods', function() {
    this.fixture.info.noContext('foo')

    expect(this.fixture.info).not.to.have.been.called
    expect(this.fixture.info.noContext).to.have.been
      .calledOnce
      .calledWithExactly('foo')
  })

})

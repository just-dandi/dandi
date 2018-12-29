import { expect } from 'chai'
import { stub } from 'sinon'

import { getMetadata } from '../index'

describe('getMetadata', () => {
  it('initializes metadata if it does not already exist', () => {
    const initValue = { foo: 'bar' }
    const init = stub().callsFake(() => initValue)
    const key = Symbol('test')
    const target = {}

    expect(getMetadata(key, init, target)).to.equal(initValue)
    expect(init).to.have.been.calledOnce
  })

  it('returns existing metadata and does not initialize', () => {
    const initValue = { foo: 'bar' }
    const init = stub().callsFake(() => initValue)
    const key = Symbol('test')
    const target = {}
    target[key] = { foo: 'kazoo' }

    expect(getMetadata(key, init, target)).to.deep.equal({ foo: 'kazoo' })
    expect(init).not.to.have.been.called
  })

  it('initializes non-existing metadata with an empty object if no initializer is specified', () => {
    const key = Symbol('test')
    const target = {}

    expect(getMetadata(key, null, target)).to.be.empty
  })
})

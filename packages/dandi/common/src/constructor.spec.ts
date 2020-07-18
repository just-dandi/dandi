import { expect } from 'chai'

import { isConstructor } from '../index'

class TestClass {}

describe('isConstructor', () => {
  it('returns true for classes', () => {
    expect(isConstructor(TestClass)).to.be.true
  })

  it('returns true for constructable functions', () => {
    expect(isConstructor(function () {})).to.be.true
  })

  it('returns false for non-constructable functions', () => {
    expect(isConstructor(() => {})).to.be.false
  })

  it('returns false for values that are not classes or functions', () => {
    expect(isConstructor(null)).to.be.false
    expect(isConstructor(undefined)).to.be.false
    expect(isConstructor({})).to.be.false
    expect(isConstructor(1)).to.be.false
    expect(isConstructor('foo')).to.be.false
    expect(isConstructor(Symbol('foo'))).to.be.false
    expect(isConstructor(new Date())).to.be.false
  })
})

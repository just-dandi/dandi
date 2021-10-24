import { expect } from 'chai'
import { spy } from 'sinon'

import { range } from './range'

describe('range', () => {
  it('iterates from start to finish', () => {
    const iterator = spy()
    range(1, 5).forEach(iterator)

    expect(iterator)
      .to.have.been.called.callCount(5)
      .calledWithExactly(1)
      .calledWithExactly(2)
      .calledWithExactly(3)
      .calledWithExactly(4)
      .calledWithExactly(5)
  })

  it('defaults the start to 0 if no end is specified', () => {
    const iterator = spy()
    range(5).forEach(iterator)

    expect(iterator)
      .to.have.been.called.callCount(6)
      .calledWithExactly(0)
      .calledWithExactly(1)
      .calledWithExactly(2)
      .calledWithExactly(3)
      .calledWithExactly(4)
      .calledWithExactly(5)
  })

  it('uses an increment if specified', () => {
    const iterator = spy()
    range(1, 9, 2).forEach(iterator)

    expect(iterator)
      .to.have.been.called.callCount(5)
      .calledWithExactly(1)
      .calledWithExactly(3)
      .calledWithExactly(5)
      .calledWithExactly(7)
      .calledWithExactly(9)
  })

  it('iterates in reverse if the start is greater than the end', () => {
    const iterator = spy()
    range(5, 1).forEach(iterator)

    expect(iterator)
      .to.have.been.called.callCount(5)
      .calledWithExactly(5)
      .calledWithExactly(4)
      .calledWithExactly(3)
      .calledWithExactly(2)
      .calledWithExactly(1)
  })

  it('iterates in reverse with an explicit step', () => {
    const iterator = spy()
    range(9, 1, -2).forEach(iterator)

    expect(iterator)
      .to.have.been.called.callCount(5)
      .calledWithExactly(9)
      .calledWithExactly(7)
      .calledWithExactly(5)
      .calledWithExactly(3)
      .calledWithExactly(1)
  })
})

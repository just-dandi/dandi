import { defineObject } from '@dandi/common'
import { expect } from 'chai'

interface TestProps {
  prop1: string
  prop2: string
}

describe('defineObject', () => {
  const props = {
    prop1: {
      get() {
        return 'prop1'
      },
    },
    prop2: {
      get: () => 'prop2',
    },
  } as const

  function verifyProps<T extends TestProps>(obj: T): void {
    expect(obj.prop1).to.equal('prop1')
    expect(obj.prop2).to.equal('prop2')
  }

  it('creates an object with the specified properties when only property descriptors are provided', () => {
    const obj = defineObject(props)

    verifyProps(obj)
  })

  it('creates an object with the specified properties when an initial object is provided', () => {
    const init = {
      initProp: 'initProp',
    }
    const obj = defineObject(init, props)

    expect(obj.initProp).to.equal('initProp')
    verifyProps(obj)
  })

  it('creates an object with the specified properties when a function is provided as the initial object', () => {
    function init(): string {
      return 'init'
    }
    const obj = defineObject(init, props)

    expect(obj()).to.equal('init')
    verifyProps(obj)
  })
})

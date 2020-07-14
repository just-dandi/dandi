import { Memoizer } from '@dandi/common'
import { expect } from 'chai'

describe('Memoizer', () => {

  let memoizer: Memoizer

  beforeEach(() => {
    memoizer = new Memoizer()
  })
  afterEach(() => {
    memoizer = undefined
  })

  it('returns the same object when it is the first object added', () => {
    const obj = { foo: 'bar', yes: 'okay' }
    expect(memoizer.add(obj)).to.equal(obj)
  })

  it('returns the same object on subsequent calls with the same object', () => {
    const obj = { foo: 'bar', yes: 'okay' }
    memoizer.add(obj)
    expect(memoizer.add(obj)).to.equal(obj)
  })

  it('returns the original object when a new object with the same properties is added', () => {
    const obj1 = { foo: 'bar', yes: 'okay' }
    const obj2 = { foo: 'bar', yes: 'okay' }
    memoizer.add(obj1)

    expect(memoizer.add(obj2)).to.equal(obj1)
    expect(memoizer.add(obj2)).not.to.equal(obj2)
  })

  it('returns separate objects when two objects use different constructors', () => {
    class Obj1 {
      constructor(public readonly foo: string, public readonly yes: string) {}
    }
    class Obj2 {
      constructor(public readonly foo: string, public readonly yes: string) {}
    }
    const obj1 = new Obj1('bar', 'okay')
    const obj2 = new Obj2('bar', 'okay')
    memoizer.add(obj1)

    expect(memoizer.add(obj2)).to.equal(obj2)
    expect(memoizer.add(obj2)).not.to.equal(obj1)
  })

  it('returns the same object when using a class constructor', () => {
    class Obj {
      constructor(public readonly foo: string, public readonly yes: string) {}
    }
    const obj1 = new Obj('bar', 'okay')
    const obj2 = new Obj('bar', 'okay')
    memoizer.add(obj1)

    expect(memoizer.add(obj2)).to.equal(obj1)
    expect(memoizer.add(obj2)).not.to.equal(obj2)
  })

  it('returns separate objects when two objects use subclassing constructors', () => {
    class Obj1 {
      constructor(public readonly foo: string, public readonly yes: string) {}
    }
    class Obj2 extends Obj1 {
      constructor(foo: string, yes: string) {
        super(foo, yes)
      }
    }
    const obj1 = new Obj1('bar', 'okay')
    const obj2 = new Obj2('bar', 'okay')
    memoizer.add(obj1)

    expect(memoizer.add(obj2)).to.equal(obj2)
    expect(memoizer.add(obj2)).not.to.equal(obj1)
  })

  it('returns different objects when different keys are set', () => {
    const obj1 = { foo: 'bar', yes: 'okay' }
    const obj2 = { foo: 'bar', no: 'okay' }
    memoizer.add(obj1)

    expect(memoizer.add(obj2)).to.equal(obj2)
    expect(memoizer.add(obj2)).not.to.equal(obj1)
  })

  it('returns different objects when the keys have different values', () => {
    const obj1 = { foo: 'bar', yes: 'okay' }
    const obj2 = { foo: 'bar', yes: 'actuallynothanks' }
    memoizer.add(obj1)

    expect(memoizer.add(obj2)).to.equal(obj2)
    expect(memoizer.add(obj2)).not.to.equal(obj1)
  })

})

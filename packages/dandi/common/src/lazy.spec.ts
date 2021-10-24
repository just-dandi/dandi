import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

import { Lazy } from './lazy'

describe('@Lazy()', () => {
  @Lazy()
  class Test {
    constructor(private readonly accessor: SinonStub) {}

    @Lazy()
    public get foo(): any {
      return this.accessor()
    }
  }

  it('returns the property value', () => {
    const accessor = stub().returns('bar')
    const test = new Test(accessor)
    expect(test.foo).to.equal('bar')
  })

  it('returns the same value for subsequent calls', () => {
    const accessor = stub().callsFake(() => ({}))
    const test = new Test(accessor)

    const result1 = test.foo
    const result2 = test.foo

    expect(result1).to.equal(result2)
  })

  it('does not call the accessor multiple times for subsequent calls', () => {
    const accessor = stub().returns('bar')
    const test = new Test(accessor)
    test.foo
    test.foo

    expect(accessor).to.have.been.calledOnce
  })

  it('throws when used with a set accessor', () => {
    function defineLazySetter(): void {
      @Lazy()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestSet {
        @Lazy()
        public get foo(): string {
          return 'bar'
        }

        public set foo(value: string) {}
      }
    }

    expect(defineLazySetter).to.throw('@Lazy() cannot be used with a set accessor (on TestSet.foo)')
  })

  it('throws when missing a getter', () => {
    function defineLazyField(): void {
      @Lazy()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestNoGet {
        @Lazy()
        public readonly foo: string
      }
    }

    expect(defineLazyField).to.throw('No get accessor for lazy property TestNoGet.foo')
  })

  it('works when defined on an abstract class', () => {
    @Lazy()
    class LazyTestBase {
      constructor(private readonly accessor: SinonStub) {}

      @Lazy()
      public get foo(): any {
        return this.accessor()
      }
    }

    class LazyTestSubClass extends LazyTestBase {}

    const accessor = stub().callsFake(() => ({}))
    const test = new LazyTestSubClass(accessor)

    const result1 = test.foo
    const result2 = test.foo

    expect(result1).to.equal(result2)
  })
})

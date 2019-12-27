import { Inject, InjectionTokenTypeError } from '@dandi/core'
import { getInjectableParamMetadata, methodTarget } from '@dandi/core/internal/util'
import { SymbolToken } from '@dandi/core/types'

import { expect } from 'chai'

describe('@Inject', () => {
  it("sets the specified token on the decorated parameter's metadata", () => {
    const token = new SymbolToken('test')
    class TestClass {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(@Inject(token) param: any) {}
    }
    const meta = getInjectableParamMetadata(methodTarget(TestClass), null, 0)
    expect(meta.token).to.exist
    expect(meta.token).to.equal(token)
  })

  it('throws if the specified token is not a valid InjectionToken', () => {
    class TestClass {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(param: any) {}
    }

    expect(() => Inject({} as any)(TestClass, null, 0)).to.throw(InjectionTokenTypeError)
  })
})

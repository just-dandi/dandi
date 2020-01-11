import { InjectionTokenTypeError, NoSelf } from '@dandi/core'
import { Injectable, Multi } from '@dandi/core/decorators'
import { INJECTABLE_REGISTRATION_DATA, InjectableRegistrationData } from '@dandi/core/internal/util'

import { expect } from 'chai'

describe('@Injectable', () => {

  function findRegistrationData(t: any): InjectableRegistrationData {
    return INJECTABLE_REGISTRATION_DATA.find(({ target }) => target === t)
  }

  it('adds the decorated class to the global injectable data', () => {
    class TestClass {}

    Injectable()(TestClass)

    expect(findRegistrationData(TestClass)).to.exist
  })

  it('registers the decorated class for the specified token', () => {
    class FooClass {
      public bar: string
    }
    class TestClass {}

    Injectable(FooClass)(TestClass)

    const regData = findRegistrationData(TestClass)

    expect(regData).to.exist
    expect(regData.providerOptions).to.deep.equal({ provide: FooClass })
  })

  it('throws if the specified token is not a valid InjectionToken', () => {
    class TestClass {}

    expect(() => Injectable({} as any)(TestClass)).to.throw(InjectionTokenTypeError)
  })

  it('sets any specified options', () => {
    class TestClass {}

    Injectable(Multi, NoSelf)(TestClass)

    const regData = findRegistrationData(TestClass)

    expect(regData).to.exist
    expect(regData.providerOptions).to.deep.equal({
      multi: true,
      noSelf: true,
    })
  })
})

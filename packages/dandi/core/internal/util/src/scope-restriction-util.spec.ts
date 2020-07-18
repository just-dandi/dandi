import { BehaviorScopeRestriction, OpinionatedToken, Provider, ScopeBehavior, SymbolToken } from '@dandi/core'
import { getRestrictedScope, getScopeRestriction, isScopeBehavior } from '@dandi/core/internal/util'
import { globalSymbol } from '@dandi/core/src/global-symbol'

import { expect } from 'chai'

describe('isScopeBehavior', () => {
  it('returns true if the passed object is a valid ScopeBehavior instance', () => {
    expect(isScopeBehavior(ScopeBehavior.perInjector)).to.be.true
  })

  it('returns false if the object is not a function', () => {
    const obj = {
      value: globalSymbol('ScopeBehavior.test').toString(),
    }
    expect(isScopeBehavior(obj)).to.be.false
  })

  it('returns false if the object is a function, but its value is not a symbol', () => {
    const obj = Object.assign(function notAScopeBehavior() {}, {
      value: 'not-a-symbol',
    })
    expect(isScopeBehavior(obj)).to.be.false
  })

  it('returns false if the object is a function and the value is a symbol, but the symbol is not for a ScopeBehavior', () => {
    const obj = Object.assign(function notAScopeBehavior() {}, {
      value: globalSymbol('NotAScopeBehavior'),
    })
    expect(isScopeBehavior(obj)).to.be.false
  })
})

describe('getScopeRestriction', () => {
  describe('when called with an injection token', () => {
    it('returns undefined in the token is not opinionated', () => {
      const token = new SymbolToken('scope-restriction-test')

      expect(getScopeRestriction(token)).to.be.undefined
    })

    it('returns undefined in the token is opinionated, but does not specify a scope restriction', () => {
      const token = new OpinionatedToken('scope-restriction-test', { multi: false })

      expect(getScopeRestriction(token)).to.be.undefined
    })

    it('returns the scope restriction if defined', () => {
      class TestScope {}
      const token = new OpinionatedToken('scope-restriction-test', { restrictScope: TestScope })

      expect(getScopeRestriction(token)).to.equal(TestScope)
    })
  })

  describe('when called with a provider', () => {
    it('returns undefined if the provider does not define a scope restriction, and the token it provides is not opinionated', () => {
      const token = new SymbolToken('scope-restriction-test')
      const provider: Provider<string> = {
        provide: token,
        useValue: 'foo',
      }

      expect(getScopeRestriction(provider)).to.be.undefined
    })

    it('returns undefined if the provider does not define a scope restriction, and the token it provides is opinionated, but does not specify a scope restriction', () => {
      const token = new OpinionatedToken('scope-restriction-test', { multi: false })
      const provider: Provider<string> = {
        provide: token,
        useValue: 'foo',
      }

      expect(getScopeRestriction(provider)).to.be.undefined
    })

    it('returns the scope restriction from the provider if the token does not specify one', () => {
      class TestScope {}
      const token = new SymbolToken('scope-restriction-test')
      const provider: Provider<string> = {
        provide: token,
        useValue: 'foo',
        restrictScope: TestScope,
      }

      expect(getScopeRestriction(provider)).to.equal(TestScope)
    })

    it('returns the scope restriction from the token if it is specified', () => {
      class TestScope {}
      const token = new OpinionatedToken('scope-restriction-test', { restrictScope: TestScope })
      const provider: Provider<string> = {
        provide: token,
        useValue: 'foo',
      }

      expect(getScopeRestriction(provider)).to.equal(TestScope)
    })

    it('returns the scope restriction from the token if both the provider and token specify one', () => {
      class TestTokenScope {}
      class TestProviderScope {}
      const token = new OpinionatedToken('scope-restriction-test', { restrictScope: TestTokenScope })
      const provider: Provider<string> = {
        provide: token,
        useValue: 'foo',
        restrictScope: TestProviderScope,
      }

      expect(getScopeRestriction(provider)).to.equal(TestTokenScope)
    })
  })
})

describe('getRestrictedScope', () => {
  it('returns undefined when called with undefined', () => {
    expect(getRestrictedScope(undefined)).to.be.undefined
  })

  it('returns the scope of a BehaviorScopeRestriction', () => {
    class TestScope {}
    const restriction = new BehaviorScopeRestriction(ScopeBehavior.perInjector, TestScope)

    expect(getRestrictedScope(restriction)).to.equal(TestScope)
  })

  it('returns undefined when called with an unscoped ScopeBehavior', () => {
    expect(getRestrictedScope(ScopeBehavior.perInjector)).to.equal(undefined)
  })

  it('returns the restriction when called with a valid InjectionScope', () => {
    class TestScope {}

    expect(getRestrictedScope(TestScope)).to.equal(TestScope)
  })
})

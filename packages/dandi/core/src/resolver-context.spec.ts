import { Provider, InjectorContext, SymbolToken, ResolverContext } from '@dandi/core'
import { AppInjectorContext } from '@dandi/core/testing'

import { expect } from 'chai'
import { spy, stub } from 'sinon'

const chaiInspect = Symbol.for('chai/inspect')

describe('ResolverContext', function() {
  function provider<T, TProvider extends Provider<T>>(obj: TProvider): TProvider {
    obj[chaiInspect] = () => `Provider[provide: ${obj.provide}]`
    return obj
  }

  beforeEach(function() {
    this.sharedToken = new SymbolToken('shared-token')
    this.parentToken1 = new SymbolToken('test-parent1')
    this.parentToken2 = new SymbolToken('test-parent2')
    this.childToken1 = new SymbolToken('test-child1')
    this.childToken2 = new SymbolToken('test-child2')
    this.sharedValueParent = {}
    this.sharedValueChild = {}
    this.parentValue1 = {}
    this.parentValue2 = {}
    this.childValue1 = {}
    this.childValue2 = {}
    this.sharedProviderParent = provider({
      provide: this.sharedToken,
      useValue: this.sharedValueParent,
    })
    this.sharedProviderChild = provider({
      provide: this.sharedToken,
      useValue: this.sharedValueChild,
    })
    this.parentProvider1 = provider({
      provide: this.parentToken1,
      useValue: this.parentValue1,
    })
    this.parentProvider2 = provider({
      provide: this.parentToken2,
      useValue: this.parentValue2,
    })
    this.childProvider1 = provider({
      provide: this.childToken1,
      useValue: this.childValue1,
    })
    this.childProvider2 = provider({
      provide: this.childToken2,
      useValue: this.childValue2,
    })
    this.appInjectorContext = new AppInjectorContext()
    this.parentContext = new ResolverContext(this.parentToken1, this.appInjectorContext, function TestContext(){}, [this.parentProvider1, this.parentProvider2, this.sharedProviderParent])
    this.childContext = this.parentContext.createResolverContext(ResolverContext, this.childToken1, function TestContext(){}, this.childProvider1, this.childProvider2, this.sharedProviderChild)
  })

  afterEach(function() {
    this.appInjectorContext.dispose('test complete')
  })

  describe('create', function() {
    it('returns an instance of ResolveContext', function() {
      expect(this.parentContext).to.exist
      expect(this.parentContext).to.be.instanceOf(InjectorContext)
    })

    it('includes the specified providers', function() {
      expect(this.parentContext.find(this.parentProvider1.provide)).exist
      expect(this.parentContext.find(this.parentProvider2.provide)).exist
    })
  })

  describe('childContext', function() {
    it('creates a ResolveContext instance that is a child of the call target', function() {
      expect((this.childContext as any).parent).to.equal(this.parentContext)
    })

    it('creates a new repository containing any specified providers', function() {
      expect((this.childContext as any).repository.get(this.childToken1)).to.exist
      expect((this.childContext as any).repository.get(this.childToken2)).to.exist
    })

    it('adds the child context to its array of children', function() {
      expect((this.parentContext as any).children).to.include(this.childContext)
    })
  })

  describe('addInstance', function() {
    it('adds the instance', function() {
      this.parentContext.addInstance(this.parentValue1)
      expect((this.parentContext as any).instances).to.deep.equal([this.parentValue1])
    })
  })

  describe('match', function() {
    it('returns undefined if no token is found', function() {
      expect(new ResolverContext(new SymbolToken('test'), this.appInjectorContext, function TestContext(){}).match).to.be.undefined
    })

    it('returns the entry if one is found', function() {
      expect(this.parentContext.match).to.equal(this.parentProvider1)
    })

    it('returns the first matching entry when the same token is defined in a child context', function() {

      const overridingContext = this.childContext.createResolverContext(ResolverContext, this.sharedToken, function TestContext(){})

      expect(overridingContext.match).to.equal(this.sharedProviderChild)
    })

    it('caches find results', function() {
      const doFind = spy(this.childContext, 'doFind')

      const result1 = this.childContext.match
      const result2 = this.childContext.match

      expect(doFind).to.have.been.calledOnce
      expect(result1).to.equal(result2)
    })

    xit('finds entries only available in parent contexts', function() {
      const parentCachedFind = spy(this.parentContext as any, 'cachedFind')

      expect(
        this.childContext.repositories[0].providers.get(this.parentToken1),
        'sanity check: token was found in child context repo',
      ).to.be.undefined

      expect(this.childContext.match).to.equal(this.parentProvider1)
      expect(parentCachedFind).to.have.been.called
    })
  })

  describe('dispose', function() {
    it('clears local arrays/sets/maps', function() {
      this.childContext.addInstance(this.childValue1)
      this.childContext.match
      this.childContext.createResolverContext(ResolverContext, this.childToken1, function TestContext(){})

      expect((this.childContext as any).children).not.to.be.empty
      expect((this.childContext as any).instances).not.to.be.empty
      expect((this.childContext as any).findCache).not.to.be.empty

      this.childContext.dispose('test')

      expect(() => (this.childContext as any).children).to.throw
      expect(() => (this.childContext as any).instances).to.throw
      expect(() => (this.childContext as any).findCache).to.throw
    })

    it('disposes all disposable instances', function() {
      const childInstanceDispose = stub()
      this.childContext.addInstance({ dispose: childInstanceDispose })

      this.childContext.dispose('test')

      expect(childInstanceDispose).to.have.been.calledOnce
    })

    it('disposes all child contexts', function() {
      const childDispose = spy(this.childContext, 'dispose')

      this.parentContext.dispose('test')

      expect(childDispose).to.have.been.calledOnce
    })
  })
})

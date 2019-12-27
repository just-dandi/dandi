import { Provider, SymbolToken } from '@dandi/core'
import { DandiInjectorContext, RootInjectorContext, DandiResolverContext } from '@dandi/core/internal'

import { expect } from 'chai'
import { spy, stub } from 'sinon'

const chaiInspect = Symbol.for('chai/inspect')

describe('ResolverContext', () => {
  function provider<T, TProvider extends Provider<T>>(obj: TProvider): TProvider {
    obj[chaiInspect] = () => `Provider[provide: ${obj.provide}]`
    return obj
  }

  let sharedToken: SymbolToken<any>
  let parentToken1: SymbolToken<any>
  let parentToken2: SymbolToken<any>
  let childToken1: SymbolToken<any>
  let childToken2: SymbolToken<any>
  let sharedValueParent: any
  let sharedValueChild: any
  let parentValue1: any
  let parentValue2: any
  let childValue1: any
  let childValue2: any
  let sharedProviderChild: Provider<any>
  let sharedProviderParent: Provider<any>
  let parentProvider1: Provider<any>
  let parentProvider2: Provider<any>
  let childProvider1: Provider<any>
  let childProvider2: Provider<any>
  let rootInjectorContext: RootInjectorContext
  let parentContext: DandiInjectorContext
  let childContext: DandiInjectorContext
  let parentResolverContext: DandiResolverContext
  let childResolverContext: DandiResolverContext

  beforeEach(() => {
    sharedToken = new SymbolToken('shared-token')
    parentToken1 = new SymbolToken('test-parent1')
    parentToken2 = new SymbolToken('test-parent2')
    childToken1 = new SymbolToken('test-child1')
    childToken2 = new SymbolToken('test-child2')
    sharedValueParent = {}
    sharedValueChild = {}
    parentValue1 = {}
    parentValue2 = {}
    childValue1 = {}
    childValue2 = {}
    sharedProviderParent = provider({
      provide: sharedToken,
      useValue: sharedValueParent,
    })
    sharedProviderChild = provider({
      provide: sharedToken,
      useValue: sharedValueChild,
    })
    parentProvider1 = provider({
      provide: parentToken1,
      useValue: parentValue1,
    })
    parentProvider2 = provider({
      provide: parentToken2,
      useValue: parentValue2,
    })
    childProvider1 = provider({
      provide: childToken1,
      useValue: childValue1,
    })
    childProvider2 = provider({
      provide: childToken2,
      useValue: childValue2,
    })
    rootInjectorContext = new RootInjectorContext()
    parentContext = new DandiInjectorContext(rootInjectorContext, function TestParentContext(){}, [parentProvider1, parentProvider2, sharedProviderParent])
    parentResolverContext = new DandiResolverContext(parentToken1, parentContext)
    childContext = parentContext.createChild(function TestChildContext(){}, childProvider1, childProvider2, sharedProviderChild)
    childResolverContext = new DandiResolverContext(childToken1, childContext)
  })

  afterEach(() => {
    rootInjectorContext.dispose('test complete')
  })

  describe('addInstance', () => {
    it('adds the instance', () => {
      childResolverContext.addInstance(parentValue1)
      expect((childResolverContext as any).instances).to.deep.equal([parentValue1])
    })
  })

  describe('match', () => {
    it('returns undefined if no token is found', () => {
      expect(new DandiResolverContext(new SymbolToken('test'), rootInjectorContext).match).to.be.undefined
    })

    it('returns the entry if one is found', () => {
      expect(parentResolverContext.match).to.equal(parentProvider1)
    })

    it('returns the first matching entry when the same token is defined in a child scope', () => {

      const overridingContext = new DandiResolverContext(sharedToken, childContext)

      expect(overridingContext.match).to.equal(sharedProviderChild)
    })

    it('caches find results', () => {
      const doFind = spy(childContext as any, 'doFind')

      const result1 = childResolverContext.match
      const result2 = childResolverContext.match

      expect(doFind).to.have.been.calledOnce
      expect(result1).to.equal(result2)
    })

    it('finds entries only available in parent contexts', () => {
      const parentCachedFind = spy(parentContext as any, 'cachedFind')

      expect(
        (childContext as any).repository.providers.get(parentToken1),
        'sanity check: token was found in child scope repo',
      ).to.be.undefined

      expect(childContext.find(parentToken1)).to.equal(parentProvider1)
      expect(parentCachedFind).to.have.been.called
    })
  })

  describe('dispose', () => {
    it('clears local arrays/sets/maps', () => {
      childResolverContext.addInstance(childValue1)
      childResolverContext.match

      expect((childContext as any).findCache).not.to.be.empty

      childContext.dispose('test')

      expect(() => (childContext as any).instances).to.throw
    })

    it('disposes all disposable instances', async () => {
      const childInstanceDispose = stub()
      childResolverContext.addInstance({ dispose: childInstanceDispose })

      await childResolverContext.dispose('test')

      expect(childInstanceDispose).to.have.been.calledOnce
    })
  })
})

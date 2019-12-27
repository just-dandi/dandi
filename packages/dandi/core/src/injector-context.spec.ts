import { Disposable } from '@dandi/common'
import { InjectionToken, Provider, InjectorContext, SymbolToken } from '@dandi/core'

import { expect } from 'chai'

const chaiInspect = Symbol.for('chai/inspect')

describe('InjectorContext', function() {
  function provider<T, TProvider extends Provider<T>>(obj: TProvider): TProvider {
    obj[chaiInspect] = () => `Provider[provide: ${obj.provide}]`
    return obj
  }

  let parentToken1: InjectionToken<any>
  let parentToken2: InjectionToken<any>
  let childToken1: InjectionToken<any>
  let childToken2: InjectionToken<any>
  let parentValue1: any
  let parentValue2: any
  let childValue1: any
  let childValue2: any
  let parentProvider1: Provider<any>
  let parentProvider2: Provider<any>
  let childProvider1: Provider<any>
  let childProvider2: Provider<any>
  let parentContext: InjectorContext
  let childContext: InjectorContext

  beforeEach(() => {
    parentToken1 = new SymbolToken('test-parent1')
    parentToken2 = new SymbolToken('test-parent2')
    childToken1 = new SymbolToken('test-child1')
    childToken2 = new SymbolToken('test-child2')
    parentValue1 = {}
    parentValue2 = {}
    childValue1 = {}
    childValue2 = {}
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
    parentContext = new InjectorContext(undefined, function ParentContext(){}, [parentProvider1, parentProvider2])
    childContext = parentContext.createChild(function ChildContext(){}, childProvider1, childProvider2)
  })

  afterEach(() => {
    if (!Disposable.isDisposed(parentContext)) {
      parentContext.dispose('test complete')
    }
    parentToken1 = undefined
    parentToken2 = undefined
    childToken1 = undefined
    childToken2 = undefined
    parentValue1 = undefined
    parentValue2 = undefined
    childValue1 = undefined
    childValue2 = undefined
    parentProvider1 = undefined
    parentProvider2 = undefined
    childProvider1 = undefined
    childProvider2 = undefined
    parentContext = undefined
    childContext = undefined
  })

  describe('create', () => {
    it('returns an instance of ResolveContext', () => {
      expect(parentContext).to.exist
      expect(parentContext).to.be.instanceOf(InjectorContext)
    })

    it('includes the specified providers', () => {
      expect(parentContext.find(parentProvider1.provide)).to.exist
      expect(parentContext.find(parentProvider2.provide)).to.exist
    })
  })

  describe('createChild', () => {
    it('creates an InjectorContext instance that is a child of the call target', () => {
      expect((childContext as any).parent).to.equal(parentContext)
    })

    it('creates a new repository containing any specified providers', () => {
      expect((childContext as any).repository.providers).to.include.keys(childToken1)
      expect((childContext as any).repository.providers).to.include.keys(childToken2)
    })
  })

  describe('addSingleton', () => {
    it('adds the value to the singletons map of the repository where the provider was found', () => {
      childContext.addSingleton(parentProvider1, parentValue1)

      expect(
        (childContext as any).repository.singletons.get(parentProvider1),
        'singleton was found on the wrong repository',
      ).to.be.undefined

      expect(
        (parentContext as any).repository.singletons.get(parentProvider1),
        'singleton was not found on the expected repository',
      ).to.equal(parentValue1)
    })
  })

  describe('getSingleton', () => {
    it('gets the singleton value from the repository where the provider was found', () => {
      childContext.addSingleton(parentProvider1, parentValue1)

      expect(childContext.getSingleton(parentProvider1)).to.equal(parentValue1)
    })
  })

  describe('dispose', () => {
    it('clears local maps and repository', () => {
      childContext.dispose('test')

      expect(() => (childContext as any).repository).to.throw
      expect(() => (childContext as any).findCache).to.throw
    })
  })
})

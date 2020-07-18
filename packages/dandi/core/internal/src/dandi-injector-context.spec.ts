import { Disposable } from '@dandi/common'
import {
  DependencyInjectionScope,
  InjectionScope,
  InjectionToken,
  OpinionatedToken,
  Provider,
  Registerable,
  RegistrationSource,
  SymbolToken,
} from '@dandi/core'
import { DandiInjectorContext, Repository } from '@dandi/core/internal'

import { expect } from 'chai'
import { stub } from 'sinon'

const chaiInspect = Symbol.for('chai/inspect')

// hacky, but makes it easier to expose non-public members, which is also hacky, sorry
declare class ContextUnderTest extends DandiInjectorContext {
  readonly repository: Repository
  registerInternal(registerable: Registerable[], source?: RegistrationSource): this
}

describe('DandiInjectorContext', () => {
  class ParentContextScope {}
  class ChildContextScope {}

  function provider<T, TProvider extends Provider<T>>(obj: TProvider): TProvider {
    obj[chaiInspect] = () => `Provider[provide: ${obj.provide}]`
    return obj
  }

  let parentToken1: InjectionToken<any>
  let parentToken2: InjectionToken<any>
  let scopedParentToken1: InjectionToken<any>
  let scopedParentToken2: InjectionToken<any>
  let parentsOnlyToken: InjectionToken<any>
  let childToken1: InjectionToken<any>
  let childToken2: InjectionToken<any>
  let parentValue1: any
  let parentValue2: any
  let childValue1: any
  let childValue2: any
  let parentProvider1: Provider<any>
  let parentProvider2: Provider<any>
  let scopedParentProvider1: Provider<any>
  let scopedParentProvider2: Provider<any>
  let parentsOnlyParentProvider: Provider<any>
  let parentsOnlyChildProvider: Provider<any>
  let childProvider1: Provider<any>
  let childProvider2: Provider<any>
  let parentContext: ContextUnderTest
  let childContext: ContextUnderTest

  function scopedParentFactory(): any {
    return {}
  }

  beforeEach(() => {
    parentToken1 = new SymbolToken('test-parent1')
    parentToken2 = new SymbolToken('test-parent2')
    scopedParentToken1 = new OpinionatedToken('test-scoped-parent1', { restrictScope: ChildContextScope })
    scopedParentToken2 = new SymbolToken('test-scoped-parent2')
    parentsOnlyToken = new OpinionatedToken('test-parents-only-child', { parentsOnly: true })
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
    scopedParentProvider1 = provider({
      provide: scopedParentToken1,
      useFactory: scopedParentFactory,
    })
    scopedParentProvider2 = provider({
      provide: scopedParentToken2,
      useFactory: scopedParentFactory,
      restrictScope: ChildContextScope,
    })
    parentsOnlyParentProvider = provider({
      provide: parentsOnlyToken,
      useValue: {},
    })
    parentsOnlyChildProvider = provider({
      provide: parentsOnlyToken,
      useValue: {},
    })
    childProvider1 = provider({
      provide: childToken1,
      useValue: childValue1,
    })
    childProvider2 = provider({
      provide: childToken2,
      useValue: childValue2,
    })
    parentContext = new DandiInjectorContext(undefined, ParentContextScope, [
      parentProvider1,
      parentProvider2,
      scopedParentProvider1,
      scopedParentProvider2,
      parentsOnlyParentProvider,
    ]) as ContextUnderTest
    childContext = parentContext.createChild(
      ChildContextScope,
      childProvider1,
      childProvider2,
      parentsOnlyChildProvider,
    ) as ContextUnderTest
  })

  afterEach(() => {
    if (!Disposable.isDisposed(parentContext)) {
      parentContext.dispose('test complete')
    }
    parentToken1 = undefined
    parentToken2 = undefined
    scopedParentToken1 = undefined
    scopedParentToken2 = undefined
    parentsOnlyToken = undefined
    childToken1 = undefined
    childToken2 = undefined
    parentValue1 = undefined
    parentValue2 = undefined
    childValue1 = undefined
    childValue2 = undefined
    parentProvider1 = undefined
    parentProvider2 = undefined
    scopedParentProvider1 = undefined
    scopedParentProvider2 = undefined
    parentsOnlyParentProvider = undefined
    parentsOnlyChildProvider = undefined
    childProvider1 = undefined
    childProvider2 = undefined
    parentContext = undefined
    childContext = undefined
  })

  describe('ctr', () => {
    it('throws if no scope is specified', () => {
      expect(() => new DandiInjectorContext(parentContext, undefined)).to.throw
    })

    it('registers an InjectionScope provider for the specified scope if it is a DependencyInjectionScope instance', () => {
      const scope = new DependencyInjectionScope('test')
      const context = new DandiInjectorContext(parentContext, scope)

      // can't use `find` for InjectionScope due to `parentsOnly` option
      const repo: Repository = (context as any).repository
      expect(repo.get(InjectionScope)).to.deep.include({
        provide: InjectionScope,
        useValue: scope,
      })
    })

    it('registers nested arrays of providers', () => {
      const scope = new DependencyInjectionScope('test')
      const context = new DandiInjectorContext(undefined, scope, [
        [childProvider1, childProvider2, [parentProvider1, [parentProvider2]]],
      ])

      expect(context.find(childToken1)).to.exist
      expect(context.find(childToken2)).to.exist
      expect(context.find(parentToken1)).to.exist
      expect(context.find(parentToken2)).to.exist
    })
  })

  describe('find', () => {
    describe('token overload', () => {
      it('returns undefined if no result is found', () => {
        expect(parentContext.find(childToken1)).to.be.undefined
      })

      it('returns a ResolverContext that references the InjectorContext where the matching provider was found via the matchContext property', () => {
        const parentResult = childContext.find(parentToken1)
        const childResult = childContext.find(childToken1)

        expect(parentResult.matchContext).to.equal(parentContext)
        expect(childResult.matchContext).to.equal(childContext)
      })

      it('returns a ResolverContext that references the originating InjectorContext of the find request via the injectorContext property', () => {
        const parentResult = childContext.find(parentToken1)
        const childResult = childContext.find(childToken1)

        expect(parentResult.injectorContext).to.equal(childContext)
        expect(childResult.injectorContext).to.equal(childContext)
      })

      it('does not use providers from the starting context if the token has the "parentsOnly" option set', () => {
        expect(childContext.find(parentsOnlyToken)?.match).to.equal(parentsOnlyParentProvider)
      })

      it('does not use providers from the starting context for multi providers with the "parentsOnly" option set', () => {
        const parentsOnlyMultiToken = new OpinionatedToken('test-parents-only-multi', {
          parentsOnly: true,
          multi: true,
        })
        const parentProvider1 = provider({
          provide: parentsOnlyMultiToken,
          useValue: {},
        })
        const parentProvider2 = provider({
          provide: parentsOnlyMultiToken,
          useValue: {},
        })
        const childProvider1 = provider({
          provide: parentsOnlyMultiToken,
          useValue: {},
        })
        const childProvider2 = provider({
          provide: parentsOnlyMultiToken,
          useValue: {},
        })
        parentContext.registerInternal([parentProvider1, parentProvider2])
        childContext.registerInternal([childProvider1, childProvider2])

        const result = childContext.find(parentsOnlyMultiToken)?.match as Set<Provider<any>>
        expect([...result]).to.deep.equal([parentProvider1, parentProvider2])
      })
    })

    describe('exec overload', () => {
      it('calls the exec function with the repository and matching entry of the find operation', () => {
        const exec = stub()

        childContext.find(childToken1, exec)

        expect(exec).to.have.been.calledWith({
          injectorContext: childContext,
          result: {
            entry: childProvider1,
            context: childContext,
          },
        })
      })

      it('returns the return value of the exec function', () => {
        const execResult = {}
        const exec = stub().returns(execResult)

        expect(childContext.find(childToken1, exec)).to.equal(execResult)
      })
    })
  })

  describe('createChild', () => {
    it('returns an instance of DandiInjectorContext', () => {
      expect(parentContext).to.exist
      expect(parentContext).to.be.instanceOf(DandiInjectorContext)
    })

    it('includes the specified providers', () => {
      expect(parentContext.find(parentProvider1.provide)).to.exist
      expect(parentContext.find(parentProvider2.provide)).to.exist
    })

    it('creates an InjectorContext instance that is a child of the call target', () => {
      expect(childContext.parent).to.equal(parentContext)
    })

    it('creates a new repository containing any specified providers', () => {
      expect(childContext.find(childToken1)).to.exist
      expect(childContext.find(childToken2)).to.exist
    })
  })

  describe('addInstance', () => {
    it('adds the value for a non-scoped-restricted token and provider to the instances map of the repository where the provider was found', () => {
      childContext.addInstance(parentProvider1, parentValue1)

      expect(childContext.repository.getInstance(parentProvider1), 'instance was found on the wrong repository').to.be
        .undefined

      expect(
        parentContext.repository.getInstance(parentProvider1),
        'instance was not found on the expected repository',
      ).to.equal(parentValue1)
    })

    it('adds the value for a scope-restricted token to the repository matching the scope restriction', () => {
      const value = {}
      childContext.addInstance(scopedParentProvider1, value)

      expect(parentContext.repository.getInstance(scopedParentProvider1), 'instance was found on the wrong repository')
        .to.be.undefined

      expect(
        childContext.repository.getInstance(scopedParentProvider1),
        'instance was not found on the expected repository',
      ).to.equal(value)
    })

    it('adds the value for a scoped-restricted provider to the repository matching the scope restriction', () => {
      const value = {}
      childContext.addInstance(scopedParentProvider2, value)

      expect(parentContext.repository.getInstance(scopedParentProvider2), 'instance was found on the wrong repository')
        .to.be.undefined

      expect(
        childContext.repository.getInstance(scopedParentProvider2),
        'instance was not found on the expected repository',
      ).to.equal(value)
    })
  })

  describe('getInstance', () => {
    it('gets the instance value from the repository where the provider was found', () => {
      childContext.addInstance(parentProvider1, parentValue1)

      expect(childContext.getInstance(parentProvider1)).to.equal(parentValue1)
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

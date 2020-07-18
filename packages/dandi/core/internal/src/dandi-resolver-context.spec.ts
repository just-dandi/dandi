import { InjectionResult, InjectionScope, InjectionToken, Provider, SymbolToken } from '@dandi/core'
import { DandiInjectorContext, DandiResolverContext } from '@dandi/core/internal'

import { expect } from 'chai'
import { createStubInstance, SinonStubbedInstance } from 'sinon'

describe('ResolverContext', () => {
  let token: InjectionToken<any>
  let match: Provider<any>
  let matchContext: SinonStubbedInstance<DandiInjectorContext>
  let matchContextInst: DandiInjectorContext
  let scope: InjectionScope
  let injectorContext: SinonStubbedInstance<DandiInjectorContext>
  let injectorContextInst: DandiInjectorContext
  let resolverContext: DandiResolverContext

  beforeEach(() => {
    token = new SymbolToken('test')
    match = {
      provide: token,
      useValue: {},
    }
    matchContext = createStubInstance(DandiInjectorContext)
    matchContextInst = (matchContext as unknown) as DandiInjectorContext
    scope = class TestScope {}
    injectorContext = createStubInstance(DandiInjectorContext)
    Object.assign(injectorContext, { scope })
    injectorContextInst = (injectorContext as unknown) as DandiInjectorContext
    resolverContext = new DandiResolverContext(token, match, matchContextInst, injectorContextInst)
  })
  afterEach(() => {
    token = undefined
    match = undefined
    matchContext = undefined
    matchContextInst = undefined
    injectorContext = undefined
    injectorContextInst = undefined
    resolverContext = undefined
  })

  describe('ctr', () => {
    it('assigns the scope of the injectorContext to its injectionScope property', () => {
      expect(resolverContext.injectionScope).to.equal(scope)
    })

    it('does not throw when instantiated with undefined match and matchContext', () => {
      expect(new DandiResolverContext(token, undefined, undefined, injectorContextInst)).to.exist
    })
  })

  describe('resolveValue', () => {
    it('sets the specified value as the result', () => {
      const value = {}
      resolverContext.resolveValue(value)

      expect(resolverContext.result?.value).to.equal(value)
    })

    it('returns an InjectionResult instance containing the value', () => {
      const value = {}
      const result = resolverContext.resolveValue(value)

      expect(result).to.be.instanceof(InjectionResult)
      expect(result.value).to.equal(value)
    })
  })

  describe('getInstance', () => {
    it('passes through the result of calling getInstance on the injectorContext', () => {
      const value = {}
      const provider = {
        provide: token,
        useValue: value,
      }
      injectorContext.getInstance.withArgs(provider).returns(value)

      expect(resolverContext.getInstance(provider)).to.equal(value)
      expect(injectorContext.getInstance).to.have.been.calledOnceWithExactly(provider)
    })
  })

  describe('addInstance', () => {
    it('passes through the result of calling addInstance on the injectorContext', () => {
      const value = {}
      const provider = {
        provide: token,
        useValue: value,
      }
      injectorContext.addInstance.returnsArg(1)

      expect(resolverContext.addInstance(provider, value)).to.equal(value)
      expect(injectorContext.addInstance).to.have.been.calledOnceWithExactly(provider, value)
    })
  })
})

import { Disposable } from '@dandi/common'
import { DandiInjectorContext } from '@dandi/core/internal'
import { InjectionResult } from '@dandi/core/types'

import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance } from 'sinon'

describe('InjectionResult', () => {
  let context: SinonStubbedInstance<Disposable>
  let value: any
  let result: InjectionResult<any>

  beforeEach(() => {
    context = (createStubInstance(DandiInjectorContext) as any) as SinonStubbedInstance<Disposable>
    value = {}
    result = new InjectionResult<any>(context, value)
  })

  afterEach(() => {
    context = undefined
    value = undefined
    result = undefined
  })

  describe('value', () => {
    it('passes the result value through', () => {
      expect(result.value).to.equal(value)
    })
  })

  describe('singleValue', () => {
    it('passes the result value through', () => {
      expect(result.singleValue).to.equal(value)
    })
  })

  describe('arrayValue', () => {
    it('passes the result value through', () => {
      expect(result.arrayValue).to.equal(value)
    })
  })

  describe('dispose', () => {
    it('calls dispose on the scope', () => {
      result.dispose('test')
      expect(context.dispose).to.have.been.called
    })
  })
})

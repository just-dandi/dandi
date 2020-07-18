import { InjectionResult } from '@dandi/core/types'

import { expect } from 'chai'

describe('InjectionResult', () => {
  let value: any
  let result: InjectionResult<any>

  beforeEach(() => {
    value = {}
    result = new InjectionResult<any>(value)
  })

  afterEach(() => {
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
})

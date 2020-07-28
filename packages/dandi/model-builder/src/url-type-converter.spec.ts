import { Url } from '@dandi/common'
import { expect } from 'chai'

import { UrlTypeConverter } from './url-type-converter'

describe('UrlTypeValidator', () => {
  let validator: UrlTypeConverter

  beforeEach(() => {
    validator = new UrlTypeConverter()
  })
  afterEach(() => {
    validator = undefined
  })

  describe('convert', () => {
    it('returns a Url instance using the provided value', () => {
      const urlStr = 'http://localhost/'
      const result = validator.convert(urlStr)
      expect(result.toString()).to.equal(urlStr)
      expect(result).to.be.instanceOf(Url)
    })

    it('throws if given an invalid url', () => {
      const urlStr = '12345'
      expect(() => validator.convert(urlStr)).to.throw
    })
  })
})

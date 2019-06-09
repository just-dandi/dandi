import { Property, getModelMetadata } from '@dandi/model'
import { expect } from 'chai'

import { MemberMetadata, getAllKeys } from './member.metadata'

describe('MemberMetadata', () => {
  describe('getModelMetadata', () => {
    it('gets the metadata for each property of a flat class', () => {
      class TestClass {
        @Property(String)
        public prop: string
      }

      const result = getModelMetadata(TestClass)

      expect(Object.keys(result).length).to.equal(1)
      expect(result.prop).to.exist
      expect(result.prop).to.deep.equal({ type: String })
    })
  })

  describe('getAllKeys', () => {
    it('discovers all keys of an object', () => {
      const meta = {
        foo: {},
      }

      expect(getAllKeys(meta)).to.deep.equal(['foo'])
    })

    it('discovers all keys of an object with a prototype', () => {
      const parent = {
        foo: {},
      }
      const meta = Object.assign(Object.create(parent), {
        bar: {},
      })

      expect(getAllKeys(meta)).to.deep.equal(['bar', 'foo'])
    })
  })
})

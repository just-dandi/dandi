import { Resource } from '@dandi/hal'
import { ModelBase } from '@dandi/model'

import { expect } from 'chai'

describe('ResourceDecorator', () => {
  describe('isResource(resource)', () => {
    @Resource()
    class IsARealResource extends ModelBase {
      constructor(source?: any) {
        super(source)
      }
    }

    class Pinocchio extends ModelBase {
      constructor(source?: any) {
        super(source)
      }
    }

    it('returns true when passed a class constructor with resource metadata', () => {
      expect(Resource.isResource(IsARealResource)).to.be.true
    })

    it('returns false when passed a class constructor without resource metadata', () => {
      expect(Resource.isResource(Pinocchio)).to.be.false
    })

    it('returns true when passed an instance of a class with resource metadata', () => {
      expect(Resource.isResource(new IsARealResource())).to.be.true
    })

    it('returns false when passed an instance of a class without resource metadata', () => {
      expect(Resource.isResource(new Pinocchio())).to.be.false
    })
  })

  describe('when dealing with inheritance', () => {
    @Resource()
    class IsARealResource extends ModelBase {
      constructor(source?: any) {
        super(source)
      }
    }

    it('still returns true when passed a class constructor with resource metadata', () => {
      expect(Resource.isResource(IsARealResource), 'IsARealResource').to.be.true
    })
  })
})

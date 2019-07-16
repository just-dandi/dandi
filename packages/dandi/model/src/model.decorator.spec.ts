import { Url, Uuid } from '@dandi/common'
import { DateTime } from 'luxon'
import { expect } from 'chai'

import { MemberMetadata, getMemberMetadata, getModelMetadata } from './member.metadata'
import {
  ArrayOf,
  DateTimeFormat,
  Email,
  MapOf,
  MaxLength,
  MaxValue,
  MinLength,
  MinValue,
  OneOf,
  Pattern,
  Property,
  Required,
  SetOf,
  UrlArray,
  UrlProperty,
} from './model.decorator'
import { EMAIL_PATTERN, URL_PATTERN } from './pattern'

describe('ModelDecorator', () => {
  describe('@Property', () => {
    it("sets the type of the property on the member's metadata", () => {
      class TestClass {
        @Property(String)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.type).to.equal(String)
    })
  })

  describe('@Required', () => {
    it('sets the "required" property on the member\'s metadata', () => {
      class TestClass {
        @Required()
        public requiredProperty: string
      }
      const meta = getMemberMetadata(TestClass, 'requiredProperty')
      expect(meta.required).to.be.true
    })

    it('sets the "required" property on the member\'s metadata when decorating a set accessor', () => {
      class TestClass {
        @Required()
        public set requiredProperty(value: string) {}
      }
      const meta = getMemberMetadata(TestClass, 'requiredProperty')
      expect(meta.required).to.be.true
    })

    it('sets the "required" property on the member\'s metadata when decorating a get accessor', () => {
      class TestClass {
        @Required()
        public get requiredProperty(): string {
          return null
        }
      }
      const meta = getMemberMetadata(TestClass, 'requiredProperty')
      expect(meta.required).to.be.true
    })
  })

  describe('@MinLength', () => {
    it("sets minLength property on the member's metadata", () => {
      class TestClass {
        @MinLength(2)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.minLength).to.equal(2)
    })
  })

  describe('@MaxLength', () => {
    it("sets maxLength property on the member's metadata", () => {
      class TestClass {
        @MaxLength(3)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.maxLength).to.equal(3)
    })
  })

  describe('@MinValue', () => {
    it("sets minValue property on the member's metadata", () => {
      class TestClass {
        @MinValue(2)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.minValue).to.equal(2)
    })
  })

  describe('@MaxValue', () => {
    it("sets maxLength property on the member's metadata", () => {
      class TestClass {
        @MaxValue(3)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.maxValue).to.equal(3)
    })
  })

  describe('@MinLength', () => {
    it("sets minLength property on the member's metadata", () => {
      class TestClass {
        @MinLength(2)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.minLength).to.equal(2)
    })
  })

  describe('@Pattern', () => {
    it('sets the "pattern" property on the member\'s metadata', () => {
      class TestClass {
        @Pattern(/foo/)
        public property: string
      }
      const meta = getMemberMetadata(TestClass, 'property')
      expect(meta.pattern).to.deep.equal(/foo/)
    })
  })

  describe('@Email', () => {
    class TestClass {
      @Email()
      public email: string
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'email')
    })
    afterEach(() => {
      meta = undefined
    })

    it('sets the "pattern" property on the member\'s metadata to EMAIL_PATTERN', () => {
      expect(meta.pattern).to.equal(EMAIL_PATTERN)
    })

    it('sets the "minLength" property on the member\'s metadata to 6', () => {
      expect(meta.minLength).to.equal(6)
    })

    it('sets the "maxLength" property on the member\'s metadata to 254', () => {
      expect(meta.maxLength).to.equal(254)
    })

    it('sets the "type" property on the member\'s metadata to String', () => {
      expect(meta.type).to.equal(String)
    })
  })

  describe('@UrlProperty', () => {
    class TestClass {
      @UrlProperty()
      public url: Url
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'url')
    })
    afterEach(() => {
      meta = undefined
    })

    it('sets the "type" property on the member\'s metadata to Url', () => {
      expect(meta.type).to.equal(Url)
    })

    it('sets the "pattern" property on the member\'s metadata to URL_PATTERN', () => {
      expect(meta.pattern).to.equal(URL_PATTERN)
    })
  })

  describe('@DateTimeFormat', () => {
    class TestClass {
      @DateTimeFormat('test-format')
      public testOn: DateTime
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'testOn')
    })
    afterEach(() => {
      meta = undefined
    })

    it('sets the "type" property on the member\'s metadata to DateTime', () => {
      expect(meta.type).to.equal(DateTime)
    })

    it('sets the "format" property on the member\'s metadata to the specified format', () => {
      expect(meta.format).to.equal('test-format')
    })
  })

  describe('@ArrayOf', () => {
    class TestClass {
      @ArrayOf(String)
      public strings: string[]
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'strings')
    })
    afterEach(() => {
      meta = undefined
    })

    it('sets the "type" property on the member\'s metadata to Array', () => {
      expect(meta.type).to.equal(Array)
    })

    it('sets the "valueType" property on the member\'s metadata to the specified item type', () => {
      expect(meta.valueType).to.equal(String)
    })
  })

  describe('@UrlArray', () => {
    class TestClass {
      @UrlArray()
      public urls: Url[]
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'urls')
    })
    afterEach(() => {
      meta = undefined
    })

    it('sets the "type" property on the member\'s metadata to Array', () => {
      expect(meta.type).to.equal(Array)
    })

    it('sets the "valueType" property on the member\'s metadata to Url', () => {
      expect(meta.valueType).to.equal(Url)
    })

    it('sets the "pattern" property on the member\'s metadata to URL_PATTERN', () => {
      expect(meta.pattern).to.equal(URL_PATTERN)
    })
  })

  describe('@OneOf', () => {
    class TestClass {
      @OneOf(Uuid, String)
      public oneOf: Uuid | string
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'oneOf')
    })
    afterEach(() => {
      meta = undefined
    })

    it('sets the "type" property of the member\'s metadata to OneOf', () => {
      expect(meta.type).to.equal(OneOf)
    })

    it('sets the "oneOf" property of the member\'s metadata to the array of types passed to the decorator', () => {
      expect(meta.oneOf).to.deep.equal([Uuid, String])
    })

    it('sets "oneOf" property on member\'s metadata when used on a method parameter', () => {
      class TestClassMethod {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public testMethod(@OneOf(Uuid, String) testParam): void {}
      }

      expect(getMemberMetadata(TestClassMethod, 'testMethod', 0).oneOf).to.deep.equal([Uuid, String])
    })
  })

  describe('@SetOf', () => {
    class TestClass {
      @SetOf(String)
      public strings: Set<string>
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'strings')
    })
    afterEach(() => {
      meta = undefined
    })
    it('sets the "type" property of the member\'s metadata to Set', () => {
      expect(meta.type).to.equal(Set)
    })
    it('sets the "valueType" property on the member\'s metadata to the specified item type', () => {
      expect(meta.valueType).to.equal(String)
    })
  })

  describe('@MapOf', () => {
    class TestClass {
      @MapOf(Uuid, Number)
      public theMap: Map<Uuid, number>
    }

    let meta: MemberMetadata

    beforeEach(() => {
      meta = getMemberMetadata(TestClass, 'theMap')
    })
    afterEach(() => {
      meta = undefined
    })
    it('sets the "type" property of the member\'s metadata to Map', () => {
      expect(meta.type).to.equal(Map)
    })
    it('sets the "keyType" property on the member\'s metadata to the specified key type', () => {
      expect(meta.keyType).to.equal(Uuid)
    })
    it('sets the "valueType" property on the member\'s metadata to the specified item type', () => {
      expect(meta.valueType).to.equal(Number)
    })
  })

  describe('subclasses', () => {
    class BaseClass {
      @Property(String)
      public baseProperty: string
    }

    class SubClass extends BaseClass {
      @Property(String)
      public subProperty: string
    }

    let baseMeta
    let subMeta

    beforeEach(() => {
      baseMeta = getModelMetadata(BaseClass)
      subMeta = getModelMetadata(SubClass)
    })
    afterEach(() => {
      baseMeta = undefined
      subMeta = undefined
    })

    it('includes properties of self', () => {
      expect(baseMeta).to.have.property('baseProperty')
      expect(subMeta).to.have.property('subProperty')
    })

    it('does not include properties of subclasses', () => {
      expect(baseMeta).not.to.have.property('subProperty')
    })

    it('includes properties of base classes', () => {
      expect(subMeta).to.have.property('baseProperty')
    })
  })
})

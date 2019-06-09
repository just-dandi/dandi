import { Url, Uuid } from '@dandi/common'
import { testHarness } from '@dandi/core/testing'
import { MemberMetadata, Property, UrlProperty } from '@dandi/model'
import { MetadataModelBuilder, ModelBuilder, ModelBuilderModule } from '@dandi/model-builder'
import { expect } from 'chai'

describe('MetadataModelBuilder', () => {
  const harness = testHarness(ModelBuilderModule)
  let builder: ModelBuilder

  class TestModel {
    @UrlProperty()
    public url: Url
  }

  class TestModel2 extends TestModel {
    @Property(String)
    public prop: string
  }

  beforeEach(async () => {
    builder = await harness.inject(ModelBuilder)
  })
  afterEach(() => {
    builder = undefined
  })

  describe('constructModel', () => {
    it('converts properties to the correct types for a flat class', () => {
      const result = builder.constructModel(TestModel, { url: 'http://foo.bar' })

      expect(result.url).to.be.instanceOf(Url)
    })

    it('converts properties to the correct types for a subclass', () => {
      const result = builder.constructModel(TestModel2, { url: 'http://foo.bar' })

      expect(result.url).to.be.instanceOf(Url)
    })
  })

  describe('constructMember', () => {
    it('constructs maps with non-standard key types', () => {
      const meta: MemberMetadata = {
        type: Map,
        keyType: Uuid,
        valueType: Number,
      }

      const key1 = Uuid.create().toString()
      const key2 = Uuid.create().toString()
      const input = {
        [key1]: '1',
        [key2]: '2',
      }
      const result = builder.constructMember(meta, 'obj', input)
      const keys = [...result.keys()]
      expect(keys).to.deep.equal([Uuid.for(key1), Uuid.for(key2)])
      const values = [...result.values()]
      expect(values).to.deep.equal([1, 2])
    })
  })
})

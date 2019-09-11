import { HalModelBase, ListRelation, Relation, Relations, ResourceId } from '@dandi/hal'
import { HalModelBuilder } from '@dandi/hal-model-builder'
import { Property } from '@dandi/model'
import { PrimitiveTypeConverter } from '@dandi/model-builder'

import { expect } from 'chai'
import { createStubInstance, SinonStubbedInstance } from 'sinon'

describe(HalModelBuilder.name, () => {

  let primitiveTypeValidator: SinonStubbedInstance<PrimitiveTypeConverter>
  let builder: HalModelBuilder

  beforeEach(() => {
    primitiveTypeValidator = createStubInstance(PrimitiveTypeConverter)
    primitiveTypeValidator.convert.returnsArg(0)
    builder = new HalModelBuilder(primitiveTypeValidator as any)
  })
  afterEach(() => {
    builder = undefined
    primitiveTypeValidator = undefined
  })
  describe(HalModelBuilder.prototype.constructModel.name, () => {

    class TestHalModelParent extends HalModelBase {

      @Property(String)
      public name: string

      constructor() {
        super()
      }

    }

    class TestHalModel extends HalModelBase {

      @Property(String)
      public name: string

      @Property(String)
      @ResourceId(TestHalModelParent, 'parent')
      public parentId: string

      @Relation(TestHalModelParent)
      public parent: TestHalModelParent

      constructor() {
        super()
      }

    }

    @Relations(TestHalModelParent)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class TestHalModelParentRelations {
      @ListRelation(TestHalModel)
      public children: TestHalModel[]
    }

    it('passes through models from sources that are not a valid HalObject', () => {

      const source = { name: 'foo' }
      const result = builder.constructModel(TestHalModel, source)

      expect(result._embedded).to.be.undefined

    })

    it('adds links to models from sources that are a valid HalObject, but do not have embedded resources', () => {

      const source = {
        name: 'foo',
        _links: {
          self: { href: '.' },
        },
      }
      const result = builder.constructModel(TestHalModel, source)

      expect(result._links).to.exist
      expect(result._links.self).to.equal(source._links.self)
      expect(result._embedded).to.be.undefined

    })

    it('builds embedded relations for valid HalObject sources', () => {

      const source = {
        name: 'foo',
        _links: {
          self: { href: '.' },
        },
        _embedded: {
          parent: {
            name: 'parent',
            _links: {
              self: { href: '.' },
            },
          },
        },
      }
      const result = builder.constructModel(TestHalModel, source)

      expect(result._embedded).to.exist
      expect(result.getEmbedded('parent')).to.be.instanceof(TestHalModelParent)
      expect(result.getEmbedded('parent').name).to.equal('parent')

    })

    it('builds embedded array relations for valid HalObject sources', () => {

      const source = {
        name: 'foo',
        _links: {
          self: { href: '.' },
        },
        _embedded: {
          children: [
            {
              _links: {
                self: { href: '/foo' },
              },
              name: 'foo',
            },
            {
              _links: {
                self: { href: '/bar' },
              },
              name: 'bar',
            },
          ],
        },
      }
      const result = builder.constructModel(TestHalModelParent, source)

      expect(result._embedded).to.exist
      expect(result.getEmbedded('children')).to.be.instanceof(Array)
      expect(result.getEmbedded('children')).to.have.length(2)
      expect(result.getEmbedded('children')[0].name).to.equal('foo')
      expect(result.getEmbedded('children')[1].name).to.equal('bar')

    })

  })

})

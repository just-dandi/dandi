import { expect } from 'chai'

import { DataPropertyMetadata } from './data.property.metadata'
import { Json } from './json.decorator'
import { Property } from './model.decorator'
import { ModelUtil } from './model.util'

describe('ModelUtil', () => {
  describe('generatePathList', () => {
    it('generates a list of paths for basic types', () => {
      class TestChildClass {
        @Property(String)
        public foo: string
      }
      class TestClass {
        @Property(String)
        public bar: string

        @Property(TestChildClass)
        public child: TestChildClass
      }

      const pathList = ModelUtil.generatePathList(TestClass)

      expect(pathList).to.deep.equal(['bar', 'child.foo'])
    })

    it('stops recursion based on a provided recursion filter', () => {
      class TestChildClass {
        @Property(String)
        public foo: string
      }
      class TestClass {
        @Property(String)
        public bar: string

        @Property(TestChildClass)
        @Json()
        public child: TestChildClass
      }
      const pathList = ModelUtil.generatePathList(TestClass, {
        recursionFilter: (meta: DataPropertyMetadata) => !meta.json,
      })

      expect(pathList).to.deep.equal(['bar', 'child'])
    })

    it('uses a provider formatter', () => {
      class TestChildClass {
        @Property(String)
        public foo: string
      }
      class TestClass {
        @Property(String)
        public bar: string

        @Property(TestChildClass)
        public child: TestChildClass
      }

      const pathList = ModelUtil.generatePathList(TestClass, {
        formatter: (property) => property.toUpperCase(),
      })

      expect(pathList).to.deep.equal(['BAR', 'CHILD.FOO'])
    })
  })
})

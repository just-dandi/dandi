import { Registerable, SymbolToken } from '@dandi/core'
import { DandiModule } from '@dandi/core/internal'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('DandiModule', function () {
  class TestModule extends DandiModule {
    constructor(...entries: Registerable[]) {
      super('@dandi/core', ...entries)
    }
  }

  describe('#ctr', function () {
    beforeEach(function () {
      stub(TestModule.prototype as any, 'tag')
    })
    afterEach(function () {
      ;(TestModule.prototype as any).tag.restore()
    })

    it('is an array', function () {
      expect(Array.isArray(new TestModule())).to.be.true
    })

    it('it sets the package name using the symbol key', function () {
      const module = new TestModule()
      expect(module[DandiModule.PACKAGE]).to.equal('@dandi/core')
    })

    it('sets the module name to the name of the constructor', function () {
      const module = new TestModule()
      expect(module[DandiModule.MODULE_NAME]).to.equal('TestModule')
    })

    it('sets the module name to the name of the constructor, removing any "Builder" suffix', function () {
      class TestModuleBuilder extends TestModule {
        constructor(...entries: any[]) {
          super(...entries)
        }
      }
      const module = new TestModuleBuilder()
      expect(module[DandiModule.MODULE_NAME]).to.equal('TestModule')
    })

    it('adds any provided providers to itself', function () {
      class TestClass {}
      const testProvider = {
        provide: TestClass,
        useValue: {},
      }
      const module = new TestModule(TestClass, testProvider)
      expect(module).to.include(TestClass)
      expect(module).to.include(testProvider)
    })

    it('calls tag on the array of providers', function () {
      class TestClass {}
      const testProvider = {
        provide: TestClass,
        useValue: {},
      }
      const module = new TestModule(TestClass, testProvider)
      expect((module as any).tag).to.have.been.calledWithExactly([TestClass, testProvider])
    })
  })

  describe('#tag', function () {
    it('adds module info to class providers', function () {
      class TestClass {}

      const module = new TestModule(TestClass)

      const moduleInfo = TestClass[DandiModule.MODULE_INFO]

      // to.deep.equal doesn't seem to work correctly here due to weird behavior with the TestModule constructor
      expect(moduleInfo).to.exist
      expect(moduleInfo).to.include({
        name: 'TestModule',
        package: '@dandi/core',
      })
      expect(moduleInfo.registeredBy).to.include(module)
      expect(moduleInfo.module).to.equal(module)
    })

    it('adds module info to provider providers', function () {
      const provider = {
        provide: SymbolToken.for('testProvider'),
        useValue: {},
      }

      const module = new TestModule(provider)

      const moduleInfo = provider[DandiModule.MODULE_INFO]

      // to.deep.equal doesn't seem to work correctly here due to weird behavior with the TestModule constructor
      expect(moduleInfo).to.exist
      expect(moduleInfo).to.include({
        name: 'TestModule',
        package: '@dandi/core',
      })
      expect(moduleInfo.registeredBy).to.include(module)
      expect(moduleInfo.module).to.equal(module)
    })

    it('adds module info for tokens of provider providers', function () {
      const provider = {
        provide: SymbolToken.for('testProvider'),
        useValue: {},
      }

      const module = new TestModule(provider)

      const moduleInfo = DandiModule.moduleInfo(provider.provide)

      // to.deep.equal doesn't seem to work correctly here due to weird behavior with the TestModule constructor
      expect(moduleInfo).to.exist
      expect(moduleInfo).to.include({
        name: 'TestModule',
        package: '@dandi/core',
      })
      expect(moduleInfo.registeredBy).to.include(module)
    })
  })
})

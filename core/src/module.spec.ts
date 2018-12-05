import { Module, Registerable, SymbolToken } from '@dandi/core';

import { expect } from 'chai';
import { stub } from 'sinon';

describe('Module', function() {

  class TestModule extends Module {

    constructor(...entries: Registerable[]) {
      super('@dandi/core', ...entries);
    }

  }

  describe('#ctr', function() {

    beforeEach(function() {
      stub(TestModule.prototype as any, 'tag');
    });
    afterEach(function() {
      (TestModule.prototype as any).tag.restore();
    });

    it('is an array', function() {
      expect(Array.isArray(new TestModule())).to.be.true;
    });

    it('it sets the package name using the symbol key', function() {
      const module = new TestModule();
      expect(module[Module.PACKAGE]).to.equal('@dandi/core');
    });

    it('sets the module name to the name of the constructor', function() {
      const module = new TestModule();
      expect(module[Module.MODULE_NAME]).to.equal('TestModule');
    });

    it('sets the module name to the name of the constructor, removing any "Builder" suffix', function() {
      class TestModuleBuilder extends TestModule {
        constructor(...entries: any[]) {
          super(...entries);
        }
      }
      const module = new TestModuleBuilder()
      expect(module[Module.MODULE_NAME]).to.equal('TestModule');
    });

    it('adds any provided entries to itself', function() {
      class TestClass {}
      const testProvider = {
        provide: TestClass,
        useValue: {},
      };
      const module = new TestModule(TestClass, testProvider);
      expect(module).to.include(TestClass);
      expect(module).to.include(testProvider);
    });

    it('calls tag on the array of entries', function() {
      class TestClass {}
      const testProvider = {
        provide: TestClass,
        useValue: {},
      };
      const module = new TestModule(TestClass, testProvider);
      expect((module as any).tag).to.have.been.calledWithExactly([TestClass, testProvider]);
    });

  });

  describe('#tag', function() {

    it('adds module info to class entries', function() {
      class TestClass {}

      const module = new TestModule(TestClass);

      const moduleInfo = TestClass[Module.MODULE_INFO];

      // to.deep.equal doesn't seem to work correctly here due to weird behavior with the TestModule constructor
      expect(moduleInfo).to.exist;
      expect(moduleInfo).to.include({
        name: 'TestModule',
        package: '@dandi/core',
      });
      expect(moduleInfo.registeredBy).to.include(module);
      expect(moduleInfo.module).to.equal(module);

    });

    it('adds module info to provider entries', function() {
      const provider = {
        provide: SymbolToken.for('testProvider'),
        useValue: {},
      };

      const module = new TestModule(provider);

      const moduleInfo = provider[Module.MODULE_INFO];

      // to.deep.equal doesn't seem to work correctly here due to weird behavior with the TestModule constructor
      expect(moduleInfo).to.exist;
      expect(moduleInfo).to.include({
        name: 'TestModule',
        package: '@dandi/core',
      });
      expect(moduleInfo.registeredBy).to.include(module);
      expect(moduleInfo.module).to.equal(module);

    });

    it('adds module info for tokens of provider entries', function() {
      const provider = {
        provide: SymbolToken.for('testProvider'),
        useValue: {},
      };

      const module = new TestModule(provider);

      const moduleInfo = Module.moduleInfo(provider.provide);

      // to.deep.equal doesn't seem to work correctly here due to weird behavior with the TestModule constructor
      expect(moduleInfo).to.exist;
      expect(moduleInfo).to.include({
        name: 'TestModule',
        package: '@dandi/core',
      });
      expect(moduleInfo.registeredBy).to.include(module);

    });

  });

});

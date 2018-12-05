import { ModuleBuilder } from '@dandi/core';

import { expect } from 'chai';

describe('ModuleBuilder', function () {

  class TestModuleBuilder extends ModuleBuilder<TestModuleBuilder> {
    constructor(...entries: any[]) {
      super(TestModuleBuilder, '@dandi/core', ...entries);
    }
  }

  class TestClass {}

  describe('add', function() {

    it('creates a copy of itself the first time it is called', function() {
      const builder = new TestModuleBuilder();
      const afterAdd = builder.add(TestClass);

      expect(builder).not.to.equal(afterAdd);
      expect(builder === afterAdd).to.be.false;
    });

    it('reuses the same instance for subsequent copies', function() {
      const builder = new TestModuleBuilder();
      const afterAdd1 = builder.add(TestClass);
      const afterAdd2 = afterAdd1.add(TestClass);

      expect(afterAdd1 === afterAdd2).to.be.true;
    });

  });

});

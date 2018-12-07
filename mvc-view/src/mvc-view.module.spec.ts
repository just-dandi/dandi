import { SymbolToken } from '@dandi/core'
import { MvcViewModuleBuilder, ViewEngine, ViewMetadata } from '@dandi/mvc-view'
import { ViewEngineConfig } from '@dandi/mvc-view/src/view-engine-config'
import { expect } from 'chai'

describe('MvcViewModuleBuilder', function() {
  class TestViewEngine implements ViewEngine {
    render(view: ViewMetadata, templatePath: string, data?: any): string | Promise<string> {
      return undefined
    }
  }

  beforeEach(function() {
    this.builder = new MvcViewModuleBuilder()
  })

  describe('#engine', function() {
    it('configures a ViewEngine with the specified priority', function() {
      const builder = this.builder.engine('test', TestViewEngine, 1)
      expect(builder).to.include(TestViewEngine)
      expect(
        builder.find(
          (entry) =>
            entry.provide === ViewEngineConfig &&
            entry.useValue.engine === TestViewEngine &&
            entry.useValue.priority === 1,
        ),
      ).to.exist
    })

    it('configures a ConfiguredViewEngine with the specified priority', function() {
      const viewEngineConfig = {
        provide: new SymbolToken('testViewEngineConfig'),
        useValue: {},
      }
      const builder = this.builder.engine('test', [TestViewEngine, viewEngineConfig], 1)
      expect(builder).to.deep.include([TestViewEngine, viewEngineConfig])
      expect(
        builder.find(
          (entry) =>
            entry.provide === ViewEngineConfig &&
            entry.useValue.engine === TestViewEngine &&
            entry.useValue.priority === 1,
        ),
      ).to.exist
    })
  })
})

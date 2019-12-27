import { DandiInjector } from '@dandi/core/internal'
import { LoggerFixture } from '@dandi/core/testing'
import { ViewEngineResolver } from '@dandi/mvc-view'

import { expect } from 'chai'
import { createStubInstance } from 'sinon'

describe('ViewEngineResolver', function() {
  beforeEach(function() {
    this.exists = this.sandbox.stub(ViewEngineResolver as any, 'exists')
    this.logger = new LoggerFixture()
    this.configA = {
      engine: class EngineA {},
      priority: 3,
      extension: 'a',
    }
    this.configB = {
      engine: class EngineB {},
      extension: 'b',
    }
    this.configC = {
      engine: class EngineC {},
      extension: 'c',
    }
    this.configD = {
      engine: class EngineD {},
      priority: 0,
      extension: 'd',
    }
    this.configE = {
      engine: class EngineE {},
      priority: 1,
      extension: 'e',
    }
    this.configF = {
      engine: class EngineF {},
      priority: 0,
      extension: 'e',
    }
    this.configs = [this.configA, this.configB, this.configC, this.configD, this.configE, this.configF]
    this.injector = createStubInstance(DandiInjector)

    this.viewResolver = new ViewEngineResolver(this.logger, this.configs, this.injector)
  })

  describe('#ctr', function() {
    it('assigns an index to each of the specified configurations', function() {
      this.configs.forEach((config) => expect(config.index).to.exist)
    })

    it('sorts the configurations by ascending priority, then ascending index', function() {
      expect(this.configs).to.deep.equal([
        this.configD,
        this.configF,
        this.configE,
        this.configA,
        this.configB,
        this.configC,
      ])
    })

    it('it logs a warning when encountering configurations with duplicate extensions, and marks the config as ignored', function() {
      expect(this.logger.warn).to.have.been.calledWithExactly(
        `ignoring duplicate view engine configuration for extension 'e' (EngineE)`,
      )
      expect(this.configE.ignored).to.be.true
    })

    it('creates a map of extensions to their configured engine', function() {
      this.configs.forEach((config) => {
        if (config.ignored) {
          expect(this.viewResolver.extensions.get(config.extension)).to.exist
          expect(this.viewResolver.extensions.get(config.extension)).not.to.equal(config.engine)
        } else {
          expect(this.viewResolver.extensions.get(config.extension)).to.equal(config.engine)
        }
      })
    })
  })

  describe('#resolve', function() {
    it('returns a resolved view for a known extension with an explicitly specified name', async function() {
      const instance = {}
      this.exists.returns(true)
      this.injector.inject.returns({ singleValue: instance })

      expect(await this.viewResolver.resolve({ context: __dirname }, 'foo.a')).to.deep.equal({
        engine: instance,
        templatePath: __dirname + '/foo.a',
      })
    })

    it('returns a resolved view for a known extension with the name specified by view metadata', async function() {
      const instance = {}
      this.exists.returns(true)
      this.injector.inject.returns({ singleValue: instance })

      expect(await this.viewResolver.resolve({ context: __dirname, name: 'foo.a' })).to.deep.equal({
        engine: instance,
        templatePath: __dirname + '/foo.a',
      })
    })

    it('returns a cached resolved view when called for the same path multiple times', async function() {
      const instance = {}
      this.exists.returns(true)
      this.injector.inject.returns({ singleValue: instance })

      const resolved = await this.viewResolver.resolve({ context: __dirname }, 'foo.a')
      expect(await this.viewResolver.resolve({ context: __dirname }, 'foo.a')).to.equal(resolved)
    })

    it('locates a file by iterating the configurations and checking for files with the configured extension', async function() {
      this.exists.callsFake((path) => path.endsWith('.e'))
      this.injector.inject.callsFake((ctr) => ({ singleValue: new ctr() }))

      const resolved = await this.viewResolver.resolve({ context: __dirname }, 'foo')
      expect(resolved.engine).to.be.instanceof(this.configF.engine)
    })

    it('skips ignored configurations when searching for files', async function() {
      // use a configuration that comes after the extension with an ignored configuration
      this.exists.callsFake((path) => path.endsWith('.c'))
      this.injector.inject.callsFake((ctr) => ({ singleValue: new ctr() }))

      await this.viewResolver.resolve({ context: __dirname }, 'foo')
      // should only get one call to exists with a path that ends with .c
      expect(this.exists.getCalls().filter((call) => call.args[0].endsWith('e')).length).to.equal(1)
    })
  })
})

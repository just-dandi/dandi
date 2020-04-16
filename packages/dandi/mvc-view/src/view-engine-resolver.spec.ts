import { Constructor } from '@dandi/common'
import { Injector } from '@dandi/core'
import { DandiInjector } from '@dandi/core/internal'
import { LoggerFixture, stub } from '@dandi/core/testing'
import { ViewEngineResolver } from '@dandi/mvc-view'

import { expect } from 'chai'
import { createStubInstance, SinonStub, SinonStubbedInstance } from 'sinon'
import { MissingTemplateError } from './missing-template.error'

describe('ViewEngineResolver', () => {

  let exists: SinonStub
  let logger: LoggerFixture
  let configA: any
  let configB: any
  let configC: any
  let configD: any
  let configE: any
  let configF: any
  let configs: any[]
  let injector: SinonStubbedInstance<Injector>
  let viewResolver: ViewEngineResolver

  beforeEach(() => {
    exists = stub(ViewEngineResolver as any, 'exists')
    logger = new LoggerFixture()
    configA = {
      engine: class EngineA {},
      priority: 3,
      extension: 'a',
    }
    configB = {
      engine: class EngineB {},
      extension: 'b',
    }
    configC = {
      engine: class EngineC {},
      extension: 'c',
    }
    configD = {
      engine: class EngineD {},
      priority: 0,
      extension: 'd',
    }
    configE = {
      engine: class EngineE {},
      priority: 1,
      extension: 'e',
    }
    configF = {
      engine: class EngineF {},
      priority: 0,
      extension: 'e',
    }
    configs = [configA, configB, configC, configD, configE, configF]
    injector = createStubInstance(DandiInjector)

    viewResolver = new ViewEngineResolver(logger, configs, injector as unknown as Injector)
  })
  afterEach(() => {
    exists.restore()
    exists = undefined
    logger = undefined
    configA = undefined
    configB = undefined
    configC = undefined
    configD = undefined
    configE = undefined
    configF = undefined
    configs = undefined
    injector = undefined
    viewResolver = undefined
  })

  describe('#ctr', () => {
    it('assigns an index to each of the specified configurations', () => {
      configs.forEach((config) => expect(config.index).to.exist)
    })

    it('sorts the configurations by ascending priority, then ascending index', () => {
      expect(configs).to.deep.equal([
        configD,
        configF,
        configE,
        configA,
        configB,
        configC,
      ])
    })

    it('it logs a warning when encountering configurations with duplicate extensions, and marks the config as ignored', () => {
      expect(logger.warn).to.have.been.calledWithExactly(
        `ignoring duplicate view engine configuration for extension 'e' (EngineE)`,
      )
      expect(configE.ignored).to.be.true
    })

    it('creates a map of extensions to their configured engine', () => {
      configs.forEach((config) => {
        if (config.ignored) {
          expect((viewResolver as any).extensions.get(config.extension)).to.exist
          expect((viewResolver as any).extensions.get(config.extension)).not.to.equal(config.engine)
        } else {
          expect((viewResolver as any).extensions.get(config.extension)).to.equal(config.engine)
        }
      })
    })
  })

  describe('#resolve', () => {
    it('returns a resolved view for a known extension with an explicitly specified name', async () => {
      const instance = {}
      exists.returns(true)
      injector.inject.returns({ singleValue: instance } as any)

      expect(await viewResolver.resolve({ context: __dirname, name: 'whateva' }, 'foo.a')).to.deep.equal({
        engine: instance,
        templatePath: __dirname + '/foo.a',
      })
    })

    it('returns a resolved view for a known extension with the name specified by view metadata', async () => {
      const instance = {}
      exists.returns(true)
      injector.inject.returns({ singleValue: instance } as any)

      expect(await viewResolver.resolve({ context: __dirname, name: 'foo.a' })).to.deep.equal({
        engine: instance,
        templatePath: __dirname + '/foo.a',
      })
    })

    it('returns a cached resolved view when called for the same path multiple times', async () => {
      const instance = {}
      exists.returns(true)
      injector.inject.returns({ singleValue: instance } as any)

      const resolved = await viewResolver.resolve({ context: __dirname, name: 'whateva' }, 'foo.a')
      expect(await viewResolver.resolve({ context: __dirname, name: 'whateva' }, 'foo.a')).to.equal(resolved)
    })

    it('locates a file by iterating the configurations and checking for files with the configured extension', async () => {
      exists.callsFake((path) => path.endsWith('.e'))
      injector.inject.callsFake((ctr: Constructor) => ({ singleValue: new ctr() } as any))

      const resolved = await viewResolver.resolve({ context: __dirname, name: 'whateva' }, 'foo')
      expect(resolved.engine).to.be.instanceof(configF.engine)
    })

    it('skips ignored configurations when searching for files', async () => {
      // use a configuration that comes after the extension with an ignored configuration
      exists.callsFake((path) => path.endsWith('.c'))
      injector.inject.callsFake((ctr: Constructor) => ({ singleValue: new ctr() } as any))

      await viewResolver.resolve({ context: __dirname, name: 'whateva' }, 'foo')
      // should only get one call to exists with a path that ends with .c
      expect(exists.getCalls().filter((call) => call.args[0].endsWith('e')).length).to.equal(5)
    })
  })

  describe('#resolveFile', () => {
    it('calls all the right functions', async () => {
      const knownPath = '/path/to/file'
      expect(await viewResolver['resolveFile'](knownPath)).to.throw(MissingTemplateError)
    })
  })

  describe('#getCasedPaths', () => {
    it('returns alternatively cased file paths for unresolved templates', () => {
      
    })
  })

  describe('#getAlternateResolvedView', () => {
    it('tries to resolve alternate view templates based on registered view engines', () => {

    })
  })
})

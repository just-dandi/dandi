import {
  EntryPoint,
  DandiApplication,
  DandiApplicationError,
  Logger,
  NoopLogger,
  Scanner,
  SymbolToken,
} from '@dandi/core'

import { expect } from 'chai'
import { spy, stub } from 'sinon'

describe('DandiApplication', () => {

  let logger: Logger

  beforeEach(() => {
    logger = new NoopLogger()
  })
  afterEach(() => {
    logger = undefined
  })

  describe('ctr', () => {
    xit('merges options with defaults', () => {
      // no config right now
    })
  })

  describe('preInit', () => {

    it('registers any providers specified in the constructor configuration', async () => {
      const token1 = new SymbolToken('test-1')
      const token2 = new SymbolToken('test-2')
      const provider1 = {
        provide: token1,
        useValue: {},
      }
      const provider2 = {
        provide: token2,
        useValue: {},
      }
      const application = new DandiApplication({
        providers: [provider1, provider2],
      })

      await (application as any).initHost.preInit()

      const appInjector = (application as any).initHost.appInjector

      expect(appInjector.context.repository.registry).to.contain.keys([token1, token2])
    })

    describe('init', () => {

      it('runs any scanners registered in the constructor configuration and adds the resulting providers to the root injector', async () => {
        const token1 = SymbolToken.for('Foo')
        const provider1 = {
          provide: token1,
          useValue: 'foo',
        }
        const scanner1 = { scan: stub().returns([provider1]) }
        const scannerProvider1 = {
          provide: Scanner,
          useValue: scanner1,
          multi: true,
        }
        const token2 = SymbolToken.for('Bar')
        const provider2 = {
          provide: token2,
          useValue: 'bar',
        }
        const scanner2 = { scan: stub().returns([provider2]) }
        const scannerProvider2 = {
          provide: Scanner,
          useValue: scanner2,
          multi: true,
        }

        const application = new DandiApplication({
          providers: [scannerProvider1, scannerProvider2],
        })

        await (application as any).initHost.preInit()
        await (application as any).initHost.init((application as any).initHost.appInjector, logger, () => new Date().valueOf())

        expect(scanner1.scan).to.have.been.calledOnce
        expect(scanner2.scan).to.have.been.calledOnce

        expect((application as any).initHost.appInjector.context.find(token1)).to.exist
        expect((application as any).initHost.appInjector.context.find(token2)).to.exist
      })
    })
  })

  describe('start', () => {
    it('calls the preInit function', async () => {
      const application = new DandiApplication()
      const init = spy((application as any).initHost, 'preInit')

      await application.run()

      expect(init).to.have.been.called
    })

    it('throws a ContainerError when called more than once', async () => {
      const container = new DandiApplication()
      await container.run()
      await expect(container.run()).to.be.rejectedWith(DandiApplicationError)
    })

    it('resolves and returns the service corresponding with the EntryPoint token, if specified', async () => {
      const value = {
        run: stub(),
      }
      const provider = {
        provide: EntryPoint,
        useFactory: stub().returns(value),
      }
      const container = new DandiApplication({ providers: [provider] })

      await container.run()

      expect(provider.useFactory).to.have.been.called
      expect(value.run).to.have.been.called
    })
  })
})

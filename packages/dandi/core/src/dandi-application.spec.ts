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
  let application: DandiApplication

  beforeEach(() => {
    logger = new NoopLogger()
  })
  afterEach(async () => {
    logger = undefined
    // IMPORTANT! must dispose to ensure repositories get reset for each test
    await application.dispose('test complete')
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
      application = new DandiApplication({
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

        application = new DandiApplication({
          providers: [scannerProvider1, scannerProvider2],
        })

        await (application as any).initHost.preInit()
        await (application as any).initHost.init((application as any).initHost.appInjector, logger, () =>
          new Date().valueOf(),
        )

        expect(scanner1.scan).to.have.been.calledOnce
        expect(scanner2.scan).to.have.been.calledOnce

        expect((application as any).initHost.appInjector.context.find(token1)).to.exist
        expect((application as any).initHost.appInjector.context.find(token2)).to.exist
      })
    })
  })

  describe('run', () => {
    it('calls the preInit function', async () => {
      application = new DandiApplication()
      const init = spy((application as any).initHost, 'preInit')

      await application.run()

      expect(init).to.have.been.called
    })

    it('throws a DandiApplicationError when called more than once', async () => {
      application = new DandiApplication()
      await application.run()
      await expect(application.run()).to.be.rejectedWith(DandiApplicationError)
    })

    it('resolves and calls the "run" method of the service corresponding with the EntryPoint token, if specified', async () => {
      const entryPoint = {
        run: stub(),
      }
      const provider = {
        provide: EntryPoint,
        useValue: entryPoint,
      }
      application = new DandiApplication({ providers: [provider] })

      await application.run()

      expect(entryPoint.run).to.have.been.called
    })

    it('returns the value returned by the run method of the entry point', async () => {
      const value = {}
      const entryPoint = {
        run: stub().resolves(value),
      }
      const provider = {
        provide: EntryPoint,
        useFactory: stub().returns(entryPoint),
      }
      application = new DandiApplication({ providers: [provider] })

      const result = await application.run()

      expect(result).to.equal(value)
    })
  })
})

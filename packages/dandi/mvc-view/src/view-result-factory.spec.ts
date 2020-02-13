import { testHarness, TestInjector } from '@dandi/core/testing'
import { createHttpRequestScope, HttpStatusCode } from '@dandi/http'
import { Route } from '@dandi/mvc'
import {
  VIEW_RESULT_FACTORY,
  ViewEngine,
  ViewEngineErrorConfig,
  ViewEngineMergedErrorConfig,
  ViewEngineResolver,
  ViewMetadata,
  ViewResultFactory,
  ViewResultFactoryError,
} from '@dandi/mvc-view'

import { expect } from 'chai'
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon'

describe('ViewResultFactory', () => {

  const harness = testHarness(VIEW_RESULT_FACTORY,
    {
      provide: ViewEngineResolver,
      useValue: createStubInstance(ViewEngineResolver),
    },
    {
      provide: ViewEngineMergedErrorConfig,
      useFactory: () => errorConfig,
    },
  )

  let injector: TestInjector
  let errorConfig: ViewEngineErrorConfig

  beforeEach(() => {
    injector = harness.createChild(createHttpRequestScope({} as any))
    errorConfig = {}
  })
  afterEach(() => {
    injector = undefined
  })

  it('is injectable', async () => {
    harness.register({
      provide: Route,
      useValue: {},
    })
    const factory = await injector.inject(ViewResultFactory)
    expect(factory).to.exist
    expect(factory).to.be.a('function')
  })

  it('throws an error if the route has no view metadata', async () => {
    harness.register({
      provide: Route,
      useValue: {},
    })
    const factory = await injector.inject(ViewResultFactory)
    await expect(factory()).to.be.rejectedWith(ViewResultFactoryError)
  })

  it('uses ViewEngineResolver to resolve the requested view', async () => {
    const view = {
      name: 'test',
    }
    harness.register({
      provide: Route,
      useValue: {
        view,
      } as any,
    })
    const resolver = await injector.injectStub(ViewEngineResolver)
    const factory = await injector.inject(ViewResultFactory)
    const engine = {
      render: stub(),
    }
    const templatePath = '/template/path'

    resolver.resolve.resolves({
      templatePath,
      engine,
    })

    await factory('test-name')

    expect(resolver.resolve).to.have.been.calledWithExactly(view, 'test-name')
  })

  it('uses ViewEngineResolver to resolve the requested view', async () => {
    const view = {
      name: 'test',
    }
    const data = {}
    harness.register({
      provide: Route,
      useValue: {
        view,
      } as any,
    })
    const resolver = await injector.injectStub(ViewEngineResolver)
    const factory = await injector.inject(ViewResultFactory)
    const engine = {
      render: stub(),
    }
    const templatePath = '/template/path'

    resolver.resolve.resolves({
      templatePath,
      engine,
    })

    const viewResult: any = await factory('test-name', data)

    expect(viewResult.data).to.equal(data)
    expect(viewResult.render).to.be.a('function')
  })

  describe('error handling', () => {

    let view: ViewMetadata
    let resolver: SinonStubbedInstance<ViewEngineResolver>
    let factory: ViewResultFactory
    let engine: ViewEngine
    let errors: Error[]

    beforeEach(async () => {
      view = {
        name: 'test',
      } as ViewMetadata
      harness.register(
        {
          provide: Route,
          useValue: {
            view,
          },
        },
      )
      errorConfig = {
        templates: {
          default: 'test-default-error-template',
          [HttpStatusCode.notFound]: 'test-404-error-template',
        },
      }
      resolver = await injector.injectStub(ViewEngineResolver)
      factory = await injector.inject(ViewResultFactory)
      engine = {
        render: stub(),
      }
      errors = [new Error('Your llama is lloose!')]
      resolver.resolve.callsFake((view: ViewMetadata, templatePath: string) => Promise.resolve({
        templatePath,
        engine,
      }))
    })
    afterEach(() => {
      view = undefined
      resolver = undefined
      factory = undefined
      engine = undefined
      errors = undefined
    })

    it('creates a ViewResult with error data if errors are present', async () => {
      const viewResult = await factory('test-name', undefined, errors)
      await viewResult.render()

      expect(engine.render).to.have.been.calledWithExactly(view, 'test-default-error-template', undefined)
    })

    it('uses the status code to determine the template used, if it is defined', async () => {
      const viewResult = await factory('test-name', undefined, errors, HttpStatusCode.notFound)
      await viewResult.render()

      expect(engine.render).to.have.been.calledWithExactly(view, 'test-404-error-template', undefined)
    })

  })

})

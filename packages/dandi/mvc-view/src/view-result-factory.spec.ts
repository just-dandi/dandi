import { testHarness, TestInjector } from '@dandi/core/testing'
import { createHttpRequestScope } from '@dandi/http'
import { Route } from '@dandi/mvc'
import { VIEW_RESULT_FACTORY, ViewEngineResolver, ViewResultFactory, ViewResultFactoryError } from '@dandi/mvc-view'
import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'

describe('ViewResultFactory', function() {

  const harness = testHarness(VIEW_RESULT_FACTORY, {
    provide: ViewEngineResolver,
    useValue: createStubInstance(ViewEngineResolver),
  })

  let injector: TestInjector

  beforeEach(() => {
    injector = harness.createChild(createHttpRequestScope({} as any))
  })
  afterEach(() => {
    injector = undefined
  })

  it('is injectable', async function() {
    harness.register({
      provide: Route,
      useValue: {},
    })
    const factory = await injector.inject(ViewResultFactory, false)
    expect(factory).to.exist
    expect(factory).to.be.a('function')
  })

  it('throws an error if the route has no view metadata', async function() {
    harness.register({
      provide: Route,
      useValue: {},
    })
    const factory = await injector.inject(ViewResultFactory, false)
    await expect(factory()).to.be.rejectedWith(ViewResultFactoryError)
  })

  it('uses ViewEngineResolver to resolve the requested view', async function() {
    const view = {
      name: 'test',
    }
    harness.register({
      provide: Route,
      useValue: {
        view,
      } as any,
    })
    const resolver = await injector.injectStub(ViewEngineResolver, false)
    const factory = await injector.inject(ViewResultFactory, false)
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

  it('uses ViewEngineResolver to resolve the requested view', async function() {
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
    const resolver = await injector.injectStub(ViewEngineResolver, false)
    const factory = await injector.inject(ViewResultFactory, false)
    const engine = {
      render: stub(),
    }
    const templatePath = '/template/path'

    resolver.resolve.resolves({
      templatePath,
      engine,
    })

    const viewResult: any = await factory('test-name', data)

    expect(viewResult.viewEngine).to.equal(engine)
    expect(viewResult.view).to.equal(view)
    expect(viewResult.templatePath).to.equal(templatePath)
    expect(viewResult.data).to.equal(data)
  })
})

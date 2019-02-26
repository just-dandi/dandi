import { Repository } from '@dandi/core'
import { TestHarness, testHarness } from '@dandi/core-testing'
import { Route } from '@dandi/mvc'
import { VIEW_RESULT_FACTORY, ViewEngineResolver, ViewResultFactory, ViewResultFactoryError } from '@dandi/mvc-view'
import { expect } from 'chai'
import { createStubInstance } from 'sinon'

describe('ViewResultFactory', function() {
  TestHarness.scopeGlobalRepository()
  const harness = testHarness(VIEW_RESULT_FACTORY, {
    provide: ViewEngineResolver,
    useValue: createStubInstance(ViewEngineResolver),
  })

  beforeEach(async function() {
    this.repo = Repository.for(this)
  })

  it('is injectable', async function() {
    this.repo.register(this, {
      provide: Route,
      useValue: {},
    })
    const factory = await harness.inject(ViewResultFactory, false, this.repo)
    expect(factory).to.exist
    expect(factory).to.be.a('function')
  })

  it('throws an error if the route has no view metadata', async function() {
    this.repo.register(this, {
      provide: Route,
      useValue: {},
    })
    const factory = await harness.inject(ViewResultFactory, false, this.repo)
    await expect(factory()).to.be.rejectedWith(ViewResultFactoryError)
  })

  it('uses ViewEngineResolver to resolve the requested view', async function() {
    const view = {
      name: 'test',
    }
    this.repo.register(this, {
      provide: Route,
      useValue: {
        view,
      } as any,
    })
    const resolver = await harness.injectStub(ViewEngineResolver, false, this.repo)
    const factory = await harness.inject(ViewResultFactory, false, this.repo)
    const engine = {}
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
    this.repo.register(this, {
      provide: Route,
      useValue: {
        view,
      } as any,
    })
    const resolver = await harness.injectStub(ViewEngineResolver, false, this.repo)
    const factory = await harness.inject(ViewResultFactory, false, this.repo)
    const engine = {}
    const templatePath = '/template/path'

    resolver.resolve.resolves({
      templatePath,
      engine,
    })

    const viewResult: any = await factory('test-name', data)

    expect(viewResult.viewEngine).to.equal(engine)
    expect(viewResult.view).to.equal(view)
    expect(viewResult.templatePath).to.equal(templatePath)
    expect(viewResult.resultObject).to.equal(data)
  })
})

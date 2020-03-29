import { resolve } from 'path'

import { createStubInstance, stub, testHarness, TestInjector } from '@dandi/core/testing'
import {
  HttpHeader,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
  HttpStatusCode,
  MimeType,
  parseMimeTypes,
} from '@dandi/http'
import { createTestHttpRequestScope } from '@dandi/http/testing'
import { Route } from '@dandi/mvc'
import {
  HttpRequestHeaderComparers,
  VIEW_RESULT_FACTORY,
  ViewEngine,
  ViewEngineErrorConfig,
  ViewEngineMergedErrorConfig,
  ViewEngineResolver,
  ViewMetadata,
  ViewResult,
  ViewResultFactory,
  ViewResultFactoryError,
  ViewRoute,
} from '@dandi/mvc-view'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

interface InvokeViewResult {
  data: any
  engine: SinonStubbedInstance<ViewEngine>
  renderResult: ViewResult
  resolver: SinonStubbedInstance<ViewEngineResolver>
  viewResult: ViewResult
}

describe('ViewResultFactory', () => {

  const harness = testHarness(VIEW_RESULT_FACTORY,
    {
      provide: ViewEngineResolver,
      useFactory: () => createStubInstance(ViewEngineResolver),
    },
    {
      provide: ViewEngineMergedErrorConfig,
      useFactory: () => errorConfig,
    },
    {
      provide: HttpRequestHeadersAccessor,
      useFactory: () => headers,
    },
  )

  let injector: TestInjector
  let errorConfig: ViewEngineErrorConfig
  let viewName: string
  let headers: SinonStubbedInstance<HttpRequestHeadersAccessor>
  let errors: Error[]
  let httpStatus: HttpStatusCode

  async function invokeView(...views: ViewMetadata[]): Promise<InvokeViewResult> {
    const data = {}
    harness.register({
      provide: Route,
      useValue: {
        views,
      } as ViewRoute,
    })

    const resolver = await injector.injectStub(ViewEngineResolver)
    const factory = await injector.inject(ViewResultFactory)
    const engine: SinonStubbedInstance<ViewEngine> = {
      render: stub(),
    }

    resolver.resolve.callsFake((view: ViewMetadata, name?: string) => Promise.resolve({
      templatePath: resolve(view?.context || '', name || view?.name),
      engine,
    }))

    const viewResult: any = await factory(viewName, data, errors, httpStatus)
    const renderResult = await viewResult.render()

    return {
      data,
      engine,
      renderResult,
      resolver,
      viewResult,
    }
  }

  beforeEach(async () => {
    injector = harness.createChild(createTestHttpRequestScope())
    errorConfig = {}
    headers = createStubInstance(HttpRequestHeadersHashAccessor)
  })
  afterEach(() => {
    injector = undefined
    errorConfig = undefined
    viewName = undefined
    headers = undefined
    errors = undefined
    httpStatus = undefined
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
    } as ViewMetadata
    viewName = 'test-name'

    const { resolver } = await invokeView(view)

    expect(resolver.resolve).to.have.been.calledWithExactly(view, 'test-name')
  })

  it('uses ViewEngineResolver to resolve the requested view', async () => {
    const view = {
      name: 'test',
    } as ViewMetadata

    const { data, viewResult } = await invokeView(view)

    expect(viewResult.data).to.equal(data)
    expect(viewResult.render).to.be.a('function')
  })

  it('selects a matching view by MIME type when multiple views are configured', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [MimeType.textHtml],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [MimeType.textHtmlPartial],
    } as ViewMetadata

    headers.get.withArgs(HttpHeader.accept).returns(parseMimeTypes(MimeType.textHtmlPartial))

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('selects a matching view by header using a function comparer', async () => {
    const viewFullComparer = stub().returns(false)
    const viewFull = {
      name: 'test-full',
      filter: [{
        ['X-Custom-Thing']: viewFullComparer,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata
    const viewPartialComparer = stub().returns(true)
    const viewPartial = {
      name: 'test-partial',
      filter: [{
        ['X-Custom-Thing']: viewPartialComparer,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata

    headers.get.withArgs('X-Custom-Thing' as any).returns('the-custom-thing-value')

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(viewFullComparer).to.have.been.calledWithExactly('the-custom-thing-value')
    expect(viewPartialComparer).to.have.been.calledWithExactly('the-custom-thing-value')
    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('selects a matching view by header using a string value comparer', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [{
        ['X-Custom-Thing']: 'not-the-right-value',
      } as HttpRequestHeaderComparers],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [{
        ['X-Custom-Thing']: 'the-custom-thing-value',
      } as HttpRequestHeaderComparers],
    } as ViewMetadata

    headers.get.withArgs('X-Custom-Thing' as any).returns('the-custom-thing-value')

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('selects a matching view by header using a RegExp value comparer', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [{
        ['X-Custom-Thing']: /right-value/,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [{
        ['X-Custom-Thing']: /custom-thing/,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata

    headers.get.withArgs('X-Custom-Thing' as any).returns('the-custom-thing-value')

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('selects a matching view by header using a number value comparer', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [{
        ['X-Custom-Thing']: 7,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [{
        ['X-Custom-Thing']: 42,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata

    headers.get.withArgs('X-Custom-Thing' as any).returns(42)

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('selects a matching view by header using a boolean value comparer', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [{
        ['X-Custom-Thing']: false,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [{
        ['X-Custom-Thing']: true,
      } as HttpRequestHeaderComparers],
    } as ViewMetadata

    headers.get.withArgs('X-Custom-Thing' as any).returns(true)

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('selects a matching view by header using an object value comparer', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [{
        ['X-Custom-Thing']: { isThisIt: 'nope' },
      } as HttpRequestHeaderComparers],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [{
        ['X-Custom-Thing']: { isThisIt: 'yes' },
      } as HttpRequestHeaderComparers],
    } as ViewMetadata

    headers.get.withArgs('X-Custom-Thing' as any).returns({ isThisIt: 'yes' } as any)

    const {
      engine,
      data,
    } = await invokeView(viewFull, viewPartial)

    expect(engine.render).to.have.been.calledWithExactly(viewPartial, resolve(viewPartial.name), data)
  })

  it('throws an error if none of the configured views match the request', async () => {
    const viewFull = {
      name: 'test-full',
      filter: [MimeType.textHtml],
    } as ViewMetadata
    const viewPartial = {
      name: 'test-partial',
      filter: [MimeType.textHtmlPartial],
    } as ViewMetadata

    headers.get.withArgs(HttpHeader.accept).returns(parseMimeTypes(MimeType.applicationXml))

    await expect(invokeView(viewFull, viewPartial)).to.be.rejectedWith(ViewResultFactoryError)
  })

  describe('error handling', () => {

    let view: ViewMetadata

    beforeEach(async () => {
      view = {
        name: 'test',
      } as ViewMetadata
      errorConfig = {
        templates: {
          default: 'test-default-error-template',
          [HttpStatusCode.notFound]: 'test-404-error-template',
        },
      }
      errors = [new Error('Your llama is lloose!')]
    })
    afterEach(() => {
      view = undefined
    })

    it('creates a ViewResult with error data if errors are present', async () => {
      const { data, engine } = await invokeView(view)

      expect(engine.render).to.have.been.calledWithExactly(undefined, resolve('test-default-error-template'), data)
    })

    it('uses the status code to determine the template used, if it is defined', async () => {
      httpStatus = HttpStatusCode.notFound
      const { data, engine } = await invokeView(view)

      expect(engine.render).to.have.been.calledWithExactly(undefined, resolve('test-404-error-template'), data)
    })

  })

})

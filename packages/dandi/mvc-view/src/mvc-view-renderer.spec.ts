import { testHarness, TestInjector } from '@dandi/core/testing'
import {
  createHttpRequestScope,
  HttpHeader,
  HttpModule,
  HttpRequest,
  HttpRequestAcceptTypes,
  MimeType,
  parseMimeTypes,
} from '@dandi/http'
import {
  defaultHttpPipelineRenderer, HttpPipelineConfig,
  HttpPipelineRenderer,
  HttpPipelineRendererProvider,
  HttpPipelineResult,
} from '@dandi/http-pipeline'
import { TestApplicationJsonRenderer } from '@dandi/http-pipeline/testing'
import { Route } from '@dandi/mvc'
import { makeViewResult, MvcViewRenderer, ViewEngineConfig, ViewResultFactory } from '@dandi/mvc-view'

import { expect } from 'chai'
import { SinonStub, SinonStubbedInstance, stub } from 'sinon'

describe('MvcViewRenderer', () => {

  const harness = testHarness(
    HttpModule,
    MvcViewRenderer,
    HttpPipelineRendererProvider,
    defaultHttpPipelineRenderer(TestApplicationJsonRenderer),
    {
      provide: Route,
      useValue: {
        path: '/test',
      },
    },
    {
      provide: HttpRequest,
      useFactory: () => req,
    },
    {
      provide: HttpRequestAcceptTypes,
      useValue: parseMimeTypes(MimeType.textHtml),
    },
    {
      provide: ViewResultFactory,
      useFactory: () => stub(),
    },
    {
      provide: HttpPipelineResult,
      useFactory: () => ({}),
    },
    {
      provide: ViewEngineConfig,
      useValue: {},
    },
    {
      provide: HttpPipelineConfig,
      useValue: {},
    },
  )

  let req: SinonStubbedInstance<HttpRequest>
  let pipelineRenderer: HttpPipelineRenderer
  let requestInjector: TestInjector

  beforeEach(async () => {
    req = {
      get: stub<[HttpHeader], string>()
        .withArgs(HttpHeader.accept)
        .returns(MimeType.textHtml),
    } as SinonStubbedInstance<HttpRequest>
    requestInjector = harness.createChild(createHttpRequestScope(req))
    pipelineRenderer = await requestInjector.inject(HttpPipelineRenderer)
  })
  afterEach(() => {
    pipelineRenderer = undefined
    requestInjector = undefined
  })

  it('is registered as a Renderer for text/html', () => {

    expect(pipelineRenderer).to.be.instanceof(MvcViewRenderer)

  })

  it('passes through the rendered value of an existing ViewResult', async () => {

    const viewResult = makeViewResult(
      {
        render: stub().returns('foo!'),
      },
      undefined,
      undefined,
      {},
    )

    expect(await pipelineRenderer.render(parseMimeTypes(MimeType.textHtml), viewResult))
      .to.deep.equal({
        contentType: MimeType.textHtml,
        statusCode: undefined,
        headers: undefined,
        renderedBody: 'foo!',
      })

  })

  it('returns a ViewResult containing the output of calling the provided ViewResultFactory', async () => {
    const viewResultFactory = await requestInjector.inject(ViewResultFactory) as SinonStub
    viewResultFactory.resolves({ render: () => 'foo!' })

    expect(await pipelineRenderer.render(parseMimeTypes(MimeType.textHtml), {}))
      .to.deep.equal({
        statusCode: undefined,
        contentType: MimeType.textHtml,
        headers: undefined,
        renderedBody: 'foo!',
      })
  })
})

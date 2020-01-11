import { testHarness, TestInjector } from '@dandi/core/testing'
import { HttpRequest, MimeTypes, HttpRequestAcceptTypes, parseMimeTypes, HttpRequestScope } from '@dandi/http'
import {
  defaultHttpPipelineRenderer,
  HttpPipelineRendererProvider,
  HttpPipelineRenderer,
} from '@dandi/http-pipeline'
import { TestApplicationJsonRenderer } from '@dandi/http-pipeline/testing'
import { Route } from '@dandi/mvc'
import { MvcViewRenderer, ViewResult, ViewResultFactory } from '@dandi/mvc-view'

import { SinonStub, stub } from 'sinon'
import { expect } from 'chai'

describe('MvcViewRenderer', () => {

  const harness = testHarness(
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
      useValue: {
        get: stub().returns(MimeTypes.textHtml),
      },
    },
    {
      provide: HttpRequestAcceptTypes,
      useValue: parseMimeTypes(MimeTypes.textHtml),
    },
    {
      provide: ViewResultFactory,
      useFactory: () => stub(),
    },
  )

  let pipelineRenderer: HttpPipelineRenderer
  let requestInjector: TestInjector

  beforeEach(async () => {
    requestInjector = harness.createChild(HttpRequestScope)
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

    const viewResult = new ViewResult(
      {
        render: stub().returns('foo!'),
      },
      undefined,
      undefined,
      undefined,
    )

    expect(await pipelineRenderer.render(parseMimeTypes(MimeTypes.textHtml), viewResult))
      .to.deep.equal({
        contentType: MimeTypes.textHtml,
        statusCode: undefined,
        headers: undefined,
        renderedBody: 'foo!',
      })

  })

  it('returns a ViewResult containing the output of calling the provided ViewResultFactory', async () => {
    const viewResultFactory = await requestInjector.inject(ViewResultFactory) as SinonStub
    viewResultFactory.resolves({ value: 'foo!' })

    expect(await pipelineRenderer.render(parseMimeTypes(MimeTypes.textHtml), {}))
      .to.deep.equal({
        statusCode: undefined,
        contentType: MimeTypes.textHtml,
        headers: undefined,
        renderedBody: 'foo!',
      })
  })
})

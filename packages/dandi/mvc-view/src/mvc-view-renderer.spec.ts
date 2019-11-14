import { testHarness } from '@dandi/core/testing'
import { HttpRequest, MimeTypes, HttpRequestAcceptTypes, parseMimeTypes } from '@dandi/http'
import { HttpResponseRendererProvider, DefaultHttpResponseRenderer, HttpResponseRenderer } from '@dandi/http-pipeline'
import { TestApplicationJsonRenderer } from '@dandi/http-pipeline/testing'
import { Route } from '@dandi/mvc'
import { MvcViewRenderer, ViewResult, ViewResultFactory } from '@dandi/mvc-view'

import { SinonStub, stub } from 'sinon'
import { expect } from 'chai'

describe('MvcViewRenderer', function() {

  const harness = testHarness(
    MvcViewRenderer,
    HttpResponseRendererProvider,
    DefaultHttpResponseRenderer.use(TestApplicationJsonRenderer),
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

  beforeEach(async function() {
    this.viewResult = stub()
    this.transformer = new MvcViewRenderer(this.viewResult, undefined)
    this.renderer = await harness.inject(HttpResponseRenderer)
  })

  it('is registered as a Renderer for text/html', function() {

    expect(this.renderer).to.be.instanceof(MvcViewRenderer)

  })

  it('passes through the rendered value of an existing ViewResult', async function() {

    const viewResult = new ViewResult(
      {
        render: stub().returns('foo!'),
      },
      undefined,
      undefined,
      undefined,
    )

    expect(await this.renderer.render(parseMimeTypes(MimeTypes.textHtml), viewResult))
      .to.deep.equal({
        contentType: MimeTypes.textHtml,
        renderedOutput: 'foo!',
      })

  })

  it('returns a ViewResult containing the output of calling the provided ViewResultFactory', async function() {
    const viewResultFactory = await harness.inject(ViewResultFactory) as SinonStub
    viewResultFactory.resolves({ value: 'foo!' })

    expect(await this.renderer.render(parseMimeTypes(MimeTypes.textHtml), {}))
      .to.deep.equal({
        contentType: MimeTypes.textHtml,
        renderedOutput: 'foo!',
      })
  })
})

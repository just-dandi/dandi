import { testHarness } from '@dandi/core/testing'
import { HttpRequest, MimeTypes, HttpRequestAcceptTypes, parseMimeTypes } from '@dandi/http'
import {
  DefaultObjectRenderer,
  MvcResponseRenderer,
  MvcResponseRendererProvider,
  Route,
} from '@dandi/mvc'
import { MvcViewRenderer, ViewResult, ViewResultFactory } from '@dandi/mvc-view'
import { TestApplicationJsonRenderer } from '@dandi/mvc/testing'

import { SinonStub, stub } from 'sinon'
import { expect } from 'chai'

describe('MvcViewRenderer', function() {

  const harness = testHarness(
    MvcViewRenderer,
    MvcResponseRendererProvider,
    DefaultObjectRenderer.use(TestApplicationJsonRenderer),
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
    this.renderer = await harness.inject(MvcResponseRenderer)
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

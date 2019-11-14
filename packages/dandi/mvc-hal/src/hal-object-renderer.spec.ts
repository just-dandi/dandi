import { testHarness } from '@dandi/core/testing'
import { HttpRequest, HttpRequestAcceptTypesProvider, MimeTypes, parseMimeTypes } from '@dandi/http'
import { HttpResponseRendererProvider, DefaultHttpResponseRenderer, PlainTextObjectRenderer } from '@dandi/http-pipeline'
import { TestApplicationJsonRenderer } from '@dandi/http-pipeline/testing'
import { Route } from '@dandi/mvc'
import { HalMimeTypes, HalObjectRenderer } from '@dandi/mvc-hal'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('HalObjectRenderer', function() {

  const harness = testHarness(HalObjectRenderer,
    {
      provide: TestApplicationJsonRenderer,
      useFactory: () => new TestApplicationJsonRenderer(),
    },
    HttpResponseRendererProvider,
    HttpRequestAcceptTypesProvider,
    DefaultHttpResponseRenderer.use(PlainTextObjectRenderer),
    {
      provide: HttpRequest,
      useFactory() {
        return {
          get: stub(),
        }
      },
    },
    {
      provide: Route,
      useFactory() {
        return {
          path: '/test',
        }
      },
    },
  )

  beforeEach(async function() {
    this.renderer = await harness.inject(HalObjectRenderer)
    this.jsonRenderer = await harness.inject(TestApplicationJsonRenderer)
  })


  describe('renderPipelineResult', function() {

    beforeEach(async function() {
      this.renderer = await harness.inject(HalObjectRenderer)
    })

    it('finds a renderer matching the base type and uses it to render the output', async function() {

      stub(this.jsonRenderer, 'render').resolves({
        contentType: MimeTypes.applicationJson,
        renderedOutput: '{"foo":"bar"}',
      })

      const value = { foo: 'bar' }

      await this.renderer.renderPipelineResult(HalMimeTypes.halJson, value)

      expect(this.jsonRenderer.render).to.have.been
        .calledOnce
        .calledWithExactly(parseMimeTypes(MimeTypes.applicationJson), value)

    })

    it('returns the renderedOutput of the subrenderer', async function() {

      const expected = '{"foo":"bar"}'
      stub(this.jsonRenderer, 'render').resolves({
        contentType: MimeTypes.applicationJson,
        renderedOutput: expected,
      })

      const value = { foo: 'bar' }

      const result = await this.renderer.renderPipelineResult(HalMimeTypes.halJson, value)

      expect(result).to.deep.equal(expected)
    })

  })

  describe('render', function() {

    beforeEach(async function() {
      this.renderer = await harness.inject(HalObjectRenderer)
    })

    it('returns the expected HAL mime type with the renderedOutput of the subrenderer', async function() {

      const expected = '{"foo":"bar"}'
      stub(this.jsonRenderer, 'render').resolves({
        contentType: MimeTypes.applicationJson,
        renderedOutput: expected,
      })

      const value = { foo: 'bar' }

      const result = await this.renderer.render(parseMimeTypes(HalMimeTypes.halJson), value)

      expect(result).to.deep.equal({
        contentType: HalMimeTypes.halJson,
        renderedOutput: expected,
      })

    })

  })

})

import { stubHarness } from '@dandi/core/testing'
import { MimeType, parseMimeTypes } from '@dandi/http'
import { TestTextPlainRenderer, TestMultiTextRenderer } from '@dandi/http-pipeline/testing'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('HttpPipelineRendererBase', function() {

  const harness = stubHarness(TestTextPlainRenderer)

  describe('ctr', function() {

    it('can be instantiated', async function() {

      const renderer = await harness.inject(TestTextPlainRenderer)

      expect(renderer).to.exist
      expect(renderer.renderableTypes).to.deep.equal(parseMimeTypes(MimeType.textPlain))
    })

  })

  describe('render', function() {

    beforeEach(async function() {
      this.renderer = await harness.inject(TestTextPlainRenderer)
      stub(this.renderer, 'determineContentType').returns(MimeType.textPlain)
      this.renderer.renderPipelineResult.resolves('hi')
    })

    it('returns an object with the contentType returned by determineContentType, and the renderedBody returned by renderPipelineResult', async function() {
      const result = await this.renderer.render(parseMimeTypes(MimeType.textPlain), 'hi')

      expect(result).to.deep.equal({
        statusCode: undefined,
        contentType: MimeType.textPlain,
        headers: undefined,
        renderedBody: 'hi',
      })
    })

  })

  describe('determineContentType', function() {

    beforeEach(async function() {
      harness.register(TestMultiTextRenderer)
      this.renderer = await harness.inject(TestMultiTextRenderer)
    })

    it('returns string representation of the first of the specified acceptTypes that can be rendered by the renderer', function() {

      const result = this.renderer.determineContentType(parseMimeTypes(MimeType.textHtml, MimeType.textPlain))

      expect(result).to.equal(MimeType.textHtml)

    })

    // this can happen when falling back to a default renderer
    it(`returns the renderer's default content type if none of the specified acceptTypes can be rendered by the renderer`, function() {

      const result = this.renderer.determineContentType(parseMimeTypes(MimeType.applicationJson, MimeType.anyApplication))

      expect(this.renderer.defaultContentType).to.equal(MimeType.textPlain) // sanity check
      expect(result).to.equal(this.renderer.defaultContentType)

    })

  })

})

import { stubHarness } from '@dandi/core/testing'
import { MimeTypes } from '@dandi/http'
import { PlainTextObjectRenderer } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('PlainTextObjectRenderer', function() {

  const harness = stubHarness(PlainTextObjectRenderer)

  beforeEach(async function() {
    this.renderer = await harness.inject(PlainTextObjectRenderer)
  })

  describe('renderPipelineResult', function() {

    it('returns an empty string for undefined values', async function() {
      const result = await this.renderer.renderPipelineResult(MimeTypes.textPlain, { data: undefined })

      expect(result).to.equal('')
    })

    it('returns an empty string for null values', async function() {
      const result = await this.renderer.renderPipelineResult(MimeTypes.textPlain, { data: null })

      expect(result).to.equal('')
    })

    it('calls toString() on non-null/undefined values', async function() {
      const pipelineResult = {
        data: {
          toString() {
            return 'hi'
          },
        },
      }
      const result = await this.renderer.renderPipelineResult(MimeTypes.textPlain, pipelineResult)

      expect(result).to.equal('hi')
    })

  })

})

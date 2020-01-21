import { stubHarness } from '@dandi/core/testing'
import { MimeType } from '@dandi/http'
import { NativeJsonObjectRenderer } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('NativeJsonObjectRenderer', function() {

  const harness = stubHarness(NativeJsonObjectRenderer)

  beforeEach(async function() {
    this.renderer = await harness.inject(NativeJsonObjectRenderer)
  })

  describe('renderPipelineResult', function() {

    it('returns a JSON representation of an object', async function() {
      const pipelineResult = {
        data: {
          foo: 'bar',
        },
      }
      const result = await this.renderer.renderPipelineResult(MimeType.textPlain, pipelineResult)

      expect(result).to.equal('{"foo":"bar"}')
    })

    it('returns a JSON representation of a string', async function() {
      const pipelineResult = { data: 'foo' }
      const result = await this.renderer.renderPipelineResult(MimeType.textPlain, pipelineResult)

      expect(result).to.equal('"foo"')
    })

    it('returns a JSON representation of a number', async function() {
      const pipelineResult = { data: 42 }
      const result = await this.renderer.renderPipelineResult(MimeType.textPlain, pipelineResult)

      expect(result).to.equal('42')
    })

  })

})

import { testHarness } from '@dandi/core/testing'
import { MimeType, parseMimeTypes } from '@dandi/http'
import { HttpPipelineConfig, PlainTextObjectRenderer } from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('PlainTextObjectRenderer', () => {

  const harness = testHarness(PlainTextObjectRenderer,
    {
      provide: HttpPipelineConfig,
      useValue: {},
    },
  )
  const acceptTypes = parseMimeTypes(MimeType.textPlain)

  let renderer: PlainTextObjectRenderer

  beforeEach(async () => {
    renderer = await harness.inject(PlainTextObjectRenderer)
  })
  afterEach(() => {
    renderer = undefined
  })

  describe('renderPipelineResult', () => {

    it('returns an empty string for undefined values', async () => {
      const result = await renderer.render(acceptTypes, { data: undefined })

      expect(result.renderedBody).to.equal('')
    })

    it('returns an empty string for null values', async () => {
      const result = await renderer.render(acceptTypes, { data: null })

      expect(result.renderedBody).to.equal('')
    })

    it('calls toString() on non-null/undefined values', async () => {
      const pipelineResult = {
        data: {
          toString() {
            return 'hi'
          },
        },
      }
      const result = await renderer.render(acceptTypes, pipelineResult)

      expect(result.renderedBody).to.equal('hi')
    })

  })

})

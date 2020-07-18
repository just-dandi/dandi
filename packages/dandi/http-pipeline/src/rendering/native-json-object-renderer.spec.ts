import { testHarness } from '@dandi/core/testing'
import { HttpStatusCode, MimeType, parseMimeTypes } from '@dandi/http'
import {
  HttpPipelineConfig,
  HttpPipelineErrorRendererDataFactory,
  HttpPipelineErrorResult,
  NativeJsonObjectRenderer,
} from '@dandi/http-pipeline'

import { expect } from 'chai'

describe('NativeJsonObjectRenderer', () => {
  const harness = testHarness(NativeJsonObjectRenderer, {
    provide: HttpPipelineConfig,
    useValue: {},
  })

  let renderer: NativeJsonObjectRenderer
  const accept = parseMimeTypes(MimeType.applicationJson)

  beforeEach(async () => {
    renderer = await harness.inject(NativeJsonObjectRenderer)
  })
  afterEach(() => {
    renderer = undefined
  })

  describe('renderPipelineResult', () => {
    it('returns a JSON representation of an object', async () => {
      const pipelineResult = {
        data: {
          foo: 'bar',
        },
      }
      const result = await renderer.render(accept, pipelineResult)

      expect(result.renderedBody).to.equal('{"foo":"bar"}')
    })

    it('returns a JSON representation of a string', async () => {
      const pipelineResult = { data: 'foo' }
      const result = await renderer.render(accept, pipelineResult)

      expect(result.renderedBody).to.equal('"foo"')
    })

    it('returns a JSON representation of a number', async () => {
      const pipelineResult = { data: 42 }
      const result = await renderer.render(accept, pipelineResult)

      expect(result.renderedBody).to.equal('42')
    })

    it('returns a JSON representation of error results', async () => {
      const pipelineResult: HttpPipelineErrorResult = {
        statusCode: HttpStatusCode.internalServerError,
        errors: [new Error('wtf')],
      }
      const errorResult: HttpPipelineErrorResult = Object.assign({}, pipelineResult, {
        data: new HttpPipelineErrorRendererDataFactory(pipelineResult),
      })
      const result = await renderer.render(accept, errorResult)

      expect(result.renderedBody).to.equal('{"statusCode":500,"message":"wtf","errors":[{"message":"wtf"}]}')
    })
  })
})

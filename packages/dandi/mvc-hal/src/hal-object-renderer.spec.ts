import { testHarness, TestInjector } from '@dandi/core/testing'
import {
  HttpModule,
  HttpRequest,
  HttpRequestAcceptTypesProvider,
  HttpRequestScope,
  MimeType,
  parseMimeTypes,
} from '@dandi/http'
import {
  defaultHttpPipelineRenderer,
  HttpPipelineRendererProvider,
  HttpPipelineResult,
  PlainTextObjectRenderer,
} from '@dandi/http-pipeline'
import { TestApplicationJsonRenderer } from '@dandi/http-pipeline/testing'
import { Route } from '@dandi/mvc'
import { HalMimeTypes, HalObjectRenderer } from '@dandi/mvc-hal'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('HalObjectRenderer', () => {
  let renderer: HalObjectRenderer
  let jsonRenderer: TestApplicationJsonRenderer
  let result: HttpPipelineResult
  let requestInjector: TestInjector

  const harness = testHarness(
    HalObjectRenderer,
    HttpModule,
    {
      provide: TestApplicationJsonRenderer,
      useFactory: () => new TestApplicationJsonRenderer(),
    },
    HttpPipelineRendererProvider,
    HttpRequestAcceptTypesProvider,
    defaultHttpPipelineRenderer(PlainTextObjectRenderer),
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
    {
      provide: HttpPipelineResult,
      useFactory: () => result,
    },
  )

  function setResult(data: any): void {
    result = { data }
  }

  beforeEach(async () => {
    requestInjector = harness.createChild(HttpRequestScope)
    renderer = await requestInjector.inject(HalObjectRenderer)
    jsonRenderer = await requestInjector.inject(TestApplicationJsonRenderer)
  })

  describe('renderPipelineResult', () => {
    beforeEach(async () => {
      renderer = await requestInjector.inject(HalObjectRenderer)
    })

    it('finds a renderer matching the base type and uses it to render the output', async () => {
      stub(jsonRenderer, 'render').resolves({
        contentType: MimeType.applicationJson,
        renderedBody: '{"foo":"bar"}',
      })

      setResult({ foo: 'bar' })

      await renderer.renderPipelineResult(HalMimeTypes.halJson)

      expect(jsonRenderer.render).to.have.been.calledOnce.calledWithExactly(
        parseMimeTypes(MimeType.applicationJson),
        result,
      )
    })

    it('returns the renderedBody of the subrenderer', async () => {
      const expected = '{"foo":"bar"}'
      stub(jsonRenderer, 'render').resolves({
        contentType: MimeType.applicationJson,
        renderedBody: expected,
      })

      setResult({ foo: 'bar' })

      const result = await renderer.renderPipelineResult(HalMimeTypes.halJson)

      expect(result).to.deep.equal(expected)
    })
  })

  describe('render', () => {
    beforeEach(async () => {
      renderer = await requestInjector.inject(HalObjectRenderer)
    })

    it('returns the expected HAL mime type with the renderedBody of the subrenderer', async () => {
      const expected = '{"foo":"bar"}'
      stub(jsonRenderer, 'render').resolves({
        statusCode: undefined,
        contentType: MimeType.applicationJson,
        headers: undefined,
        renderedBody: expected,
      })

      setResult({ foo: 'bar' })

      const renderResult = await renderer.render(parseMimeTypes(HalMimeTypes.halJson), result)

      expect(renderResult).to.deep.equal({
        statusCode: undefined,
        contentType: HalMimeTypes.halJson,
        headers: undefined,
        renderedBody: expected,
      })
    })
  })
})

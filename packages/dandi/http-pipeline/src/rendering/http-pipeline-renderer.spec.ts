import { Constructor } from '@dandi/common'
import { testHarness, underTest } from '@dandi/core/testing'
import { HttpModule, HttpRequest, HttpRequestScope, MimeType } from '@dandi/http'
import {
  defaultHttpPipelineRenderer,
  DefaultHttpPipelineRenderer,
  HttpPipelineRenderer,
  HttpPipelineRendererProvider,
  HttpPipelineResult,
} from '@dandi/http-pipeline'
import { TestApplicationJsonRenderer, TestTextPlainRenderer } from '@dandi/http-pipeline/testing'

import { SinonStubbedInstance, stub } from 'sinon'
import { expect } from 'chai'

describe('HttpPipelineRenderer', () => {

  // IMPORTANT! stubHarness cannot be used here, since RendererInfoProvider relies on not being able to resolve classes
  // to determine which renderers are actually registered
  const harness = testHarness(
    HttpModule,
    underTest(HttpPipelineRendererProvider),
    {
      provide: HttpRequest,
      useFactory() {
        return {
          get: stub(),
          path: `/test/${Math.random()}`,
        }
      },
    },
    defaultHttpPipelineRenderer(TestTextPlainRenderer),
    {
      provide: HttpPipelineResult,
      useFactory: () => pipelineResult,
    },
  )

  let pipelineResult: HttpPipelineResult
  let getRenderer: () => Promise<HttpPipelineRenderer>
  let defaultRenderer: Constructor<HttpPipelineRenderer>
  let req: SinonStubbedInstance<HttpRequest>

  beforeEach(async () => {
    const requestInjector = harness.createChild(HttpRequestScope)
    getRenderer = () => requestInjector.inject(HttpPipelineRenderer, false)
    defaultRenderer = await requestInjector.inject(DefaultHttpPipelineRenderer)
    req = await requestInjector.injectStub(HttpRequest)
    pipelineResult = {}
  })

  it('falls back to the default renderer if no matching renderers are available', async () => {
    const result = await getRenderer()

    expect(result).to.be.instanceof(defaultRenderer)
  })

  it('returns a matching renderer', async () => {

    harness.register(TestApplicationJsonRenderer)

    req.get.returns(MimeType.applicationJson)

    const result = await getRenderer()

    expect(result).to.be.instanceof(TestApplicationJsonRenderer)

  })

  it('returns the type of renderer for subsequent requests', async () => {

    harness.register(TestApplicationJsonRenderer)

    req.get.returns(MimeType.applicationJson)

    const result1 = await getRenderer()
    const result2 = await getRenderer()

    expect(result1).to.be.instanceof(TestApplicationJsonRenderer)
    expect(result2).to.be.instanceof(TestApplicationJsonRenderer)

  })

})

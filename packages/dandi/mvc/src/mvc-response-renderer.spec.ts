import { testHarness, underTest } from '@dandi/core/testing'
import { HttpRequest, HttpRequestAcceptTypesProvider, MimeTypes } from '@dandi/http'
import {
  DefaultObjectRenderer,
  MvcResponseRenderer,
  MvcResponseRendererProvider,
  Route,
} from '@dandi/mvc'
import { TestApplicationJsonRenderer, TestTextPlainRenderer } from '@dandi/mvc/testing'

import { stub } from 'sinon'
import { expect } from 'chai'

describe('MvcResponseRendererProvider', function() {

  // IMPORTANT! stubHarness cannot be used here, since RendererInfoProvider relies on not being able to resolve classes
  // to determine which renderers are actually registered
  const harness = testHarness(
    underTest(MvcResponseRendererProvider),
    HttpRequestAcceptTypesProvider,
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
          path: `/test/${Math.random()}`,
        }
      },
    },
    DefaultObjectRenderer.use(TestTextPlainRenderer),
  )

  beforeEach(async function() {
    this.getRenderer = () => harness.inject(MvcResponseRenderer, false)
    this.defaultRenderer = await harness.inject(DefaultObjectRenderer)
    this.req = await harness.inject(HttpRequest)
  })

  it('falls back to the default renderer if no matching renderers are available', async function() {
    const result = await this.getRenderer()

    expect(result).to.be.instanceof(this.defaultRenderer)
  })

  it('returns a matching renderer', async function() {

    harness.register(TestApplicationJsonRenderer)

    this.req.get.returns(MimeTypes.applicationJson)

    const result = await this.getRenderer()

    expect(result).to.be.instanceof(TestApplicationJsonRenderer)

  })

  it('returns the type of renderer for subsequent requests', async function() {

    harness.register(TestApplicationJsonRenderer)

    this.req.get.returns(MimeTypes.applicationJson)

    const result1 = await this.getRenderer()
    const result2 = await this.getRenderer()

    expect(result1).to.be.instanceof(TestApplicationJsonRenderer)
    expect(result2).to.be.instanceof(TestApplicationJsonRenderer)

  })

})

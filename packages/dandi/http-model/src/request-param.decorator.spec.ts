import { FactoryProvider, SymbolToken, getInjectableParamMetadata, methodTarget } from '@dandi/core'
import { HttpRequestPathParamMap, HttpRequestQueryParamMap } from '@dandi/http'
import { PathParam, QueryParam } from '@dandi/http-model'
import { ModelBuilder } from '@dandi/model-builder'

import { expect } from 'chai'

describe('@RequestParam', () => {
  it('sets a token for the decorated parameter', () => {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public method(@PathParam(String) foo: string, @QueryParam(String) bar: string): void {}
    }

    const pathMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 0)
    const queryMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 1)

    expect(pathMeta).to.exist
    expect(pathMeta.token).to.exist
    expect(pathMeta.token).to.be.instanceOf(SymbolToken)
    expect(pathMeta.token.toString()).to.contain(`@dandi/http-model#${HttpRequestPathParamMap}:method:foo`)

    expect(queryMeta).to.exist
    expect(queryMeta.token).to.exist
    expect(queryMeta.token).to.be.instanceOf(SymbolToken)
    expect(queryMeta.token.toString()).to.contain(`@dandi/http-model#${HttpRequestQueryParamMap}:method:bar`)
  })

  it('creates a provider to handle validating the param value', () => {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public method(@PathParam(String) foo: string, @QueryParam(String) bar: string): void {}
    }

    const pathMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 0)
    const queryMeta = getInjectableParamMetadata(methodTarget(TestController), 'method', 1)

    expect(pathMeta.providers).to.exist
    expect(pathMeta.providers).not.to.be.empty
    expect(pathMeta.providers[0].provide).to.equal(pathMeta.token)
    expect((pathMeta.providers[0] as FactoryProvider<any>).deps).to.include.members([
      ModelBuilder,
      HttpRequestPathParamMap,
    ])

    expect(queryMeta.providers).to.exist
    expect(queryMeta.providers).not.to.be.empty
    expect(queryMeta.providers[0].provide).to.equal(queryMeta.token)
    expect((queryMeta.providers[0] as FactoryProvider<any>).deps).to.include.members([
      ModelBuilder,
      HttpRequestQueryParamMap,
    ])
  })

  describe('validatorFactory', () => {})
})

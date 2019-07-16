import { Url } from '@dandi/common'
import { testHarness } from '@dandi/core/testing'
import { Required, UrlProperty } from '@dandi/model'
import { ModelBuilderModule } from '@dandi/model-builder'
import {
  MissingParamError,
  MvcRequest,
  PathParam,
  QueryParam,
  RequestBody,
  RequestPathParamMap,
  RequestQueryParamMap,
} from '@dandi/mvc'

import { expect } from 'chai'

describe('Request Decorators', () => {
  class TestModel {
    @UrlProperty()
    @Required()
    public url: Url
  }
  class TestController {
    public testBody(@RequestBody(TestModel) body: TestModel): TestModel {
      return body
    }

    public testPathParam(@PathParam(String) id: string): string {
      return id
    }

    public testQueryParam(@QueryParam(String) search?: string): string {
      return search
    }
  }

  const harness = testHarness(ModelBuilderModule,
    {
      provide: MvcRequest,
      useFactory: () => ({
        body: {
          url: 'http://localhost',
        },
      }),
    },
    {
      provide: RequestPathParamMap,
      useFactory: () => ({}),
    },
    {
      provide: RequestQueryParamMap,
      useFactory: () => ({}),
    },
  )

  beforeEach(function() {
    this.controller = new TestController()
  })

  describe('@RequestBody', function() {

    it('constructs and validates the body', async function() {
      const result: TestModel = await harness.invoke(this.controller, 'testBody')
      expect(result).to.be.instanceof(TestModel)
      expect(result.url).to.be.instanceof(Url)
    })

  })

  describe('@PathParam', function() {

    it('throws an error if a path param is missing', async function() {
      await expect(harness.invoke(this.controller, 'testPathParam')).to.be.rejectedWith(MissingParamError)
    })

    it('passes the path param value if present', async function() {
      const paramMap = await harness.inject(RequestPathParamMap)
      paramMap.id = 'foo'

      expect(await harness.invoke(this.controller, 'testPathParam')).to.equal('foo')
    })
  })

  describe('@QueryParam', function() {

    it('does not throw an error if a query param is optional', async function() {
      expect(await harness.invoke(this.controller, 'testQueryParam')).to.equal(undefined)
    })

    it('passes the query param value if present', async function() {
      const queryMap = await harness.inject(RequestQueryParamMap)
      queryMap.search = 'foo'

      expect(await harness.invoke(this.controller, 'testQueryParam')).to.equal('foo')
    })

  })
})

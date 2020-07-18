import { AwsHttpRequest } from '@dandi-contrib/aws-lambda'
import { testHarness } from '@dandi/core/testing'
import { HttpMethod, HttpRequest } from '@dandi/http'
import { ModelBuilderModule } from '@dandi/model-builder'

import { expect } from 'chai'

import { DataProcessorService } from './data-processor.service'
import { ReceiveDataHandler } from './receive-data.handler'
import { ReceiveDataResponse } from './receive-data.model'

describe('ReceiveDataHandler', () => {
  let classUnderTest: ReceiveDataHandler
  let body: any
  let request: HttpRequest

  const harness = testHarness(ReceiveDataHandler, DataProcessorService, ModelBuilderModule, {
    provide: HttpRequest,
    useFactory: () => request,
  })

  beforeEach(async () => {
    body = {
      requestId: 'test',
      message: 'hi!',
    }
    request = new AwsHttpRequest({
      body,
      path: 'test',
      query: {},
      params: {},
      method: HttpMethod.get,
    })
    classUnderTest = await harness.inject(ReceiveDataHandler)
  })
  afterEach(() => {
    classUnderTest = undefined
    request = undefined
  })

  describe('handleEvent', () => {
    it('converts the incoming model to the response model', async () => {
      const result: ReceiveDataResponse = await harness.invoke(classUnderTest, 'handleEvent')

      expect(result).to.haveOwnProperty('model')
      expect(result).to.haveOwnProperty('modelType')
      expect(result.model).to.deep.equal({
        requestId: 'test',
        message: 'hi!',
      })
      expect(result.modelType).to.equal('ReceiveDataModel')
    })
  })
})

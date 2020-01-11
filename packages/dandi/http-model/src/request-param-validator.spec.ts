import { ParamMetadata } from '@dandi/core/internal/util'
import { testHarnessSingle } from '@dandi/core/testing'
import { HttpRequestPathParamMap, HttpRequestScope } from '@dandi/http'
import { PathParam, RequestParamModelBuilderOptionsProvider } from '@dandi/http-model'
import { MemberMetadata } from '@dandi/model'
import { MetadataModelBuilder, PrimitiveTypeConverter, TypeConverter } from '@dandi/model-builder'

import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon'

import { requestParamValidatorFactory } from './request-param-validator'

describe('requestParamValidatorFactory', () => {
  let paramMap: { [key: string]: string }
  let paramMeta: ParamMetadata<any>
  let builder: SinonStubbedInstance<MetadataModelBuilder>
  let memberMetadata: MemberMetadata

  beforeEach(() => {
    paramMap = { foo: 'bar' }
    paramMeta = {} as any
    builder = createStubInstance(MetadataModelBuilder)
    memberMetadata = {
      type: String,
    }
  })
  afterEach(() => {
    paramMap = undefined
    builder = undefined
  })

  it('calls validators with the value from the param map specified by the key', () => {
    requestParamValidatorFactory(
      String,
      'foo',
      paramMeta,
      memberMetadata,
      paramMap,
      builder,
      RequestParamModelBuilderOptionsProvider.useFactory(),
    )

    expect(builder.constructMember).to.have.been.calledOnce.calledWith(memberMetadata, 'foo', 'bar')
  })

  it('works', async () => {
    const s = stub()
    const convert = stub()
    class TestController {
      public testMethod(@PathParam(String) foo: string): void {
        s(foo)
      }
    }
    const controller = new TestController()

    const harness = await testHarnessSingle(
      MetadataModelBuilder,
      PrimitiveTypeConverter,
      {
        provide: TypeConverter,
        useValue: {
          type: String,
          convert,
        },
      },
      {
        provide: HttpRequestPathParamMap,
        useValue: {
          foo: 'bar',
        },
      },
    )
    const requestInjector = harness.createChild(HttpRequestScope)

    await requestInjector.invoke(controller, 'testMethod')

    expect(convert).to.have.been.calledWith('bar', { type: String })
  })
})

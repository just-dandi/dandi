import { ParamMetadata } from '@dandi/core'
import { testHarnessSingle } from '@dandi/core/testing'
import { MemberMetadata } from '@dandi/model'
import { MetadataModelBuilder, PrimitiveTypeConverter, TypeConverter } from '@dandi/model-builder'
import { PathParam, RequestPathParamMap } from '@dandi/mvc'
import { expect } from 'chai'
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon'

import { RequestParamModelBuilderOptionsProvider } from './request.param.decorator'
import { requestParamValidatorFactory } from './request.param.validator'

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
        provide: RequestPathParamMap,
        useValue: {
          foo: 'bar',
        },
      },
    )

    await harness.invoke(controller, 'testMethod')

    expect(convert).to.have.been.calledWith('bar', { type: String })
  })
})

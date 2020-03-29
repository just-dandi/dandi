import { ParamMetadata } from '@dandi/core/internal/util'
import { createStubInstance } from '@dandi/core/testing'
import { InvalidParamError, MissingParamError } from '@dandi/http-model'
import { MemberMetadata } from '@dandi/model'
import { MetadataModelBuilder, MetadataModelValidator, ModelBuilderOptions } from '@dandi/model-builder'

import { expect } from 'chai'
import { SinonStubbedInstance } from 'sinon'

import { requestParamValidatorFactory } from './request-param-validator'

describe('requestParamValidatorFactory', () => {
  let paramMap: { [key: string]: string }
  let paramMeta: ParamMetadata<any>
  let builder: SinonStubbedInstance<MetadataModelBuilder>
  let memberMetadata: MemberMetadata
  let modelBuilderOptions: ModelBuilderOptions

  function invokeFactory(): any {
    return requestParamValidatorFactory(
      String,
      'foo',
      paramMeta,
      memberMetadata,
      paramMap,
      builder,
      modelBuilderOptions,
    )
  }

  beforeEach(() => {
    paramMap = { foo: 'bar' }
    paramMeta = {} as any
    builder = createStubInstance(MetadataModelBuilder)
    memberMetadata = {
      type: String,
    }
    modelBuilderOptions = {
      validators: [new MetadataModelValidator()],
      throwOnError: false,
    }
  })
  afterEach(() => {
    paramMap = undefined
    paramMeta = undefined
    builder = undefined
    memberMetadata = undefined
    modelBuilderOptions = undefined
  })

  it('calls validators with the value from the param map specified by the key', () => {
    invokeFactory()

    expect(builder.constructMember).to.have.been.calledOnce.calledWith(memberMetadata, 'foo', 'bar')
  })

  it('throws an error if the input value is undefined and the parameter is not optional', () => {
    paramMap.foo = undefined

    expect(invokeFactory).to.throw(MissingParamError)
  })

  it('throws an error if the input value is null and the parameter is not optional', () => {
    paramMap.foo = null

    expect(invokeFactory).to.throw(MissingParamError)
  })

  it('throws an error if the input value is an empty string and the parameter is not optional', () => {
    paramMap.foo = ''

    expect(invokeFactory).to.throw(MissingParamError)
  })

  it('returns undefined if the input value is undefined and the parameter is optional', () => {
    paramMap.foo = undefined
    paramMeta.optional = true

    expect(invokeFactory()).to.be.undefined
  })

  it('returns undefined if the input value is null and the parameter is optional', () => {
    paramMap.foo = null
    paramMeta.optional = true

    expect(invokeFactory()).to.be.undefined
  })

  it('returns undefined if the input value is an empty string and the parameter is optional', () => {
    paramMap.foo = ''
    paramMeta.optional = true

    expect(invokeFactory()).to.be.undefined
  })

  it('returns the result of builder.constructMember if it does not throw', () => {
    builder.constructMember.returns({ builderValue: paramMap.foo, source: paramMap.foo })

    const result = invokeFactory()

    expect(result).to.equal('bar')
  })

  it('throws an InvalidParamError if builder.constructMember throws', () => {
    builder.constructMember.throws(new Error('Your llama is lloose!'))

    expect(invokeFactory).to.throw(InvalidParamError)
  })

})

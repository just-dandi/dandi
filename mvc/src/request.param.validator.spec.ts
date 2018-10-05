import { Container } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';
import { MetadataModelBuilder, ModelBuilder, PrimitiveTypeConverter, TypeConverter } from '@dandi/model-builder';
import { PathParam, RequestPathParamMap } from '@dandi/mvc';

import { expect } from 'chai';
import { SinonStubbedInstance, stub, createStubInstance } from 'sinon';

import { RequestParamModelBuilderOptionsProvider } from './request.param.decorator';
import { requestParamValidatorFactory } from './request.param.validator';

describe('requestParamValidatorFactory', () => {
  let paramMap: { [key: string]: string };
  let builder: SinonStubbedInstance<ModelBuilder>;
  let memberMetadata: MemberMetadata;

  beforeEach(() => {
    paramMap = { foo: 'bar' };
    builder = createStubInstance(MetadataModelBuilder);
    memberMetadata = {
      type: String,
    };
  });
  afterEach(() => {
    paramMap = undefined;
    builder = undefined;
  });

  it('calls validators with the value from the param map specified by the key', () => {
    requestParamValidatorFactory(
      String,
      'foo',
      memberMetadata,
      paramMap,
      builder,
      RequestParamModelBuilderOptionsProvider.useFactory(),
    );

    expect(builder.constructMember).to.have.been.calledOnce.calledWith(memberMetadata, 'foo', 'bar');
  });

  it('works', async () => {
    const s = stub();
    const convert = stub();
    class TestController {
      public testMethod(@PathParam(String) foo: string) {
        s(foo);
      }
    }
    const controller = new TestController();
    const container = new Container({
      providers: [
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
      ],
    });
    await container.start();

    await container.invoke(controller, controller.testMethod);

    expect(convert).to.have.been.calledWith('bar', { type: String });
  });
});

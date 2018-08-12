import { Primitive } from '@dandi/common';
import { Container } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';
import {
  DecoratorModelValidator,
  ModelValidator,
  PrimitiveTypeValidator,
  TypeValidator,
} from '@dandi/model-validation';
import { PathParam, RequestPathParamMap } from '@dandi/mvc';

import { expect } from 'chai';
import { SinonStubbedInstance, stub } from 'sinon';

import { requestParamValidatorFactory } from './request.param.validator';

describe('requestParamValidatorFactory', () => {
  let paramMap: { [key: string]: string };
  let validator: SinonStubbedInstance<ModelValidator>;
  let memberMetadata: MemberMetadata;

  function makeValidator(): SinonStubbedInstance<DecoratorModelValidator> {
    return stub({
      type: Primitive,
      validate: () => {},
    }) as any;
  }

  beforeEach(() => {
    paramMap = { foo: 'bar' };
    validator = makeValidator();
    memberMetadata = {
      type: String,
    };
  });
  afterEach(() => {
    paramMap = undefined;
    validator = undefined;
  });

  it('calls validators with the value from the param map specified by the key', () => {
    requestParamValidatorFactory(String, 'foo', memberMetadata, paramMap, validator);

    expect(validator.validateMember).to.have.been.calledOnce.calledWith(memberMetadata, 'foo', 'bar');
  });

  it('works', async () => {
    const s = stub();
    const validate = stub();
    class TestController {
      public testMethod(@PathParam(String) foo: string) {
        s(foo);
      }
    }
    const controller = new TestController();
    const container = new Container({
      providers: [
        PrimitiveTypeValidator,
        {
          provide: TypeValidator,
          useValue: {
            type: String,
            validate,
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

    expect(validate).to.have.been.calledWith('bar', { type: String });
  });
});

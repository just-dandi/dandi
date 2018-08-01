import { Provider } from '@dandi/core';
import {
  AuthorizationCondition,
  getControllerMetadata,
  IsAuthorized,
} from '@dandi/mvc';

// tslint:disable no-unused-expression
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

import { Authorized } from './authorized.decorator';

const TestConditionA: Provider<AuthorizationCondition> = {
  provide: AuthorizationCondition,
  useValue: {
    allowed: true,
  },
};
const TestConditionB: Provider<AuthorizationCondition> = {
  provide: AuthorizationCondition,
  useValue: {
    allowed: true,
  },
};

@Authorized(TestConditionA)
class TestController {
  @Authorized(TestConditionB)
  public testMethod() {}
}

describe('AuthorizedDecorator', () => {
  describe('controllers', () => {
    it('it stores the specified conditions in the controller metadata', () => {
      expect(getControllerMetadata(TestController).authorization).to.include(
        TestConditionA,
      );
    });

    it('automatically includes the IsAuthorized condition', () => {
      expect(getControllerMetadata(TestController).authorization).to.include(
        IsAuthorized,
      );
    });
  });
  describe('methods', () => {
    it('it stores the specified conditions in the controller method metadata', () => {
      expect(
        getControllerMetadata(TestController).routeMap.get('testMethod')
          .authorization,
      ).to.include(TestConditionB);
    });

    it('automatically includes the IsAuthorized condition', () => {
      expect(
        getControllerMetadata(TestController).routeMap.get('testMethod')
          .authorization,
      ).to.include(IsAuthorized);
    });
  });
});

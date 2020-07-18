import { Provider } from '@dandi/core'
import { AuthorizationCondition, IsAuthorized, getControllerMetadata, Controller, HttpGet } from '@dandi/mvc'

import { expect } from 'chai'

import { Authorized } from './authorized.decorator'

const TestConditionA: Provider<AuthorizationCondition> = {
  provide: AuthorizationCondition,
  useValue: {
    allowed: true,
  },
}
const TestConditionB: Provider<AuthorizationCondition> = {
  provide: AuthorizationCondition,
  useValue: {
    allowed: true,
  },
}

describe('AuthorizedDecorator', () => {
  @Authorized(TestConditionA)
  @Controller('/authorized-test')
  class TestController {
    @Authorized(TestConditionB)
    @HttpGet()
    public testMethod(): void {}
  }

  describe('controllers', () => {
    it('it stores the specified conditions in the controller metadata', () => {
      expect(getControllerMetadata(TestController).authorization).to.include(TestConditionA)
    })

    it('automatically includes the IsAuthorized condition', () => {
      expect(getControllerMetadata(TestController).authorization).to.include(IsAuthorized)
    })
  })
  describe('methods', () => {
    it('it stores the specified conditions in the controller method metadata', () => {
      expect(getControllerMetadata(TestController).routeMap.get('testMethod').authorization).to.include(TestConditionB)
    })

    it('automatically includes the IsAuthorized condition', () => {
      expect(getControllerMetadata(TestController).routeMap.get('testMethod').authorization).to.include(IsAuthorized)
    })
  })
})

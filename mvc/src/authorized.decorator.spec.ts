// tslint:disable no-unused-expression
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

import { Authorized } from './authorized.decorator';

@Authorized()
class TestController {
  @Authorized()
  public testMethod() {}
}

describe('AuthorizedDecorator', () => {
  describe('', () => {});
});

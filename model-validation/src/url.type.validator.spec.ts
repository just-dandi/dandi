import { expect } from 'chai';

import { UrlTypeValidator } from './url.type.validator';

describe('UrlTypeValidator', () => {
  let validator: UrlTypeValidator;

  beforeEach(() => {
    validator = new UrlTypeValidator();
  });
  afterEach(() => {
    validator = undefined;
  });

  describe('validate', () => {
    it('returns a Url instance using the provided value', () => {
      const urlStr = 'http://localhost/';
      const result = validator.validate(urlStr);
      expect(result.toString()).to.equal(urlStr);
    });

    it('throws if given an invalid url', () => {
      const urlStr = '12345';
      expect(() => validator.validate(urlStr)).to.throw;
    });
  });
});

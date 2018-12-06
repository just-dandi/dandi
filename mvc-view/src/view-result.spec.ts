import { ViewResult } from '@dandi/mvc-view';
import { stub } from 'sinon';
import { expect } from 'chai';

describe('ViewResult', function() {
  beforeEach(function() {
    this.viewEngine = {
      render: stub().resolves('some html'),
    };
    this.view = {};
    this.templatePath = '/template/path';
    this.resultObject = {};
    this.viewResult = new ViewResult(this.viewEngine, this.view, this.templatePath, this.resultObject);
  });

  describe('get value()', function() {
    it('calls render() on the provided ViewEngine instance and returns its result', async function() {
      const result = await this.viewResult.value;
      expect(this.viewEngine.render).to.have.been.calledWithExactly(this.view, this.templatePath, this.resultObject);
      expect(result).to.equal('some html');
    });
  });
});

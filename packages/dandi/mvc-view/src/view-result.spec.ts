import { ViewResult } from '@dandi/mvc-view'
import { stub } from 'sinon'
import { expect } from 'chai'

describe('ViewResult', function() {
  beforeEach(function() {
    this.viewEngine = {
      render: stub().resolves('some html'),
    }
    this.view = {}
    this.templatePath = '/template/path'
    this.data = {}
    this.viewResult = new ViewResult(this.viewEngine, this.view, this.templatePath, this.data)
  })

  describe('get value()', function() {
    it('calls render() on the provided ViewEngine instance and returns its result', async function() {
      const result = await this.viewResult.value
      expect(this.viewEngine.render).to.have.been.calledWithExactly(this.view, this.templatePath, this.data)
      expect(result).to.equal('some html')
    })
  })
})

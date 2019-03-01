import { ProviderOptions } from '@dandi/core'
import { ControllerResultTransformer } from '@dandi/mvc'
import { MvcViewRenderer, ViewResult } from '@dandi/mvc-view'

import { stub } from 'sinon'
import { expect } from 'chai'

xdescribe('MvcViewRenderer', function() {
  beforeEach(function() {
    this.viewResult = stub()
    this.transformer = new MvcViewRenderer(this.viewResult, undefined)
  })

  it('is decorated with @Injectable(ControllerResultTransformer)', function() {
    expect(Reflect.get(MvcViewRenderer, ProviderOptions.valueOf() as symbol).provide).to.equal(
      ControllerResultTransformer,
    )
  })

  it('returns ControllerResults that are ViewResult instances without attempting to re-transform them', async function() {
    const result = new ViewResult(null, null, null, null)
    expect(await this.transformer.transform(result)).to.equal(result)
    expect(this.viewResult).not.to.have.been.called
  })

  it('returns the result of calling the provided ViewResultFactory', async function() {
    const result = {}
    const viewResult = new ViewResult(null, null, null, null)
    this.viewResult.resolves(viewResult)
    expect(await this.transformer.transform(result)).to.equal(viewResult)
  })
})

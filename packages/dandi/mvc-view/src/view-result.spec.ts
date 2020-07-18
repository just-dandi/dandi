import { makeViewResult, ViewEngine, ViewMetadata, ViewResult } from '@dandi/mvc-view'

import { expect } from 'chai'
import { SinonStubbedInstance, stub } from 'sinon'

describe('makeViewResult', () => {
  let viewEngine: SinonStubbedInstance<ViewEngine>
  let view: ViewMetadata
  let templatePath: string
  let data: any
  let viewResult: ViewResult

  beforeEach(() => {
    viewEngine = {
      render: stub<[ViewMetadata, string], string>().resolves('some html'),
    }
    view = {} as ViewMetadata
    templatePath = '/template/path'
    data = {}
    viewResult = makeViewResult(viewEngine, view, templatePath, data)
  })
  afterEach(() => {
    viewEngine = undefined
    view = undefined
    templatePath = undefined
    data = undefined
    viewResult = undefined
  })

  describe('render', () => {
    it('calls render() on the provided ViewEngine instance and returns its result', async () => {
      const result = await viewResult.render()
      expect(viewEngine.render).to.have.been.calledWithExactly(view, templatePath, data)
      expect(result).to.equal('some html')
    })
  })
})

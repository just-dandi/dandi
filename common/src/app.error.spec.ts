import { expect } from 'chai'
import { stub } from 'sinon'

import { AppError } from './app.error'

describe('AppError', () => {
  let appError: AppError

  beforeEach(() => {
    appError = new AppError()
    appError.stack = 'app-error-stack'
  })
  afterEach(() => {
    appError = undefined
  })

  describe('AppError.stack', () => {
    it('returns the stack property of errors that are not AppError instances', () => {
      const error = { stack: 'not-an-app-error' }
      expect(AppError.stack(error as any)).to.equal(error.stack)
    })

    it('returns the output of getStack for errors that are AppError instances', () => {
      stub(appError, 'getStack').returns('is-an-app-error')
      AppError.stack(appError)
      expect(appError.getStack).to.have.been.calledOnce
    })
  })

  describe('getStack', () => {
    it('returns the constructor name and stack of the AppError', () => {
      expect(appError.getStack()).to.equal('AppError app-error-stack')
    })

    describe('innerError', () => {
      let withInnerError: AppError

      beforeEach(() => {
        withInnerError = new AppError('with-inner-error', appError)
        withInnerError.stack = 'with-inner-error-stack'
      })
      afterEach(() => {
        withInnerError = undefined
      })

      it('includes the stack of an AppError innerError', () => {
        expect(withInnerError.getStack()).to.equal('AppError with-inner-error-stack\n Inner AppError app-error-stack')
      })

      it('includes the stack of a non-AppError innerError', () => {
        withInnerError = new AppError('with-inner-error', {
          stack: 'non-app-error-stack',
        } as any)
        withInnerError.stack = 'with-inner-error-stack'

        expect(withInnerError.getStack()).to.equal('AppError with-inner-error-stack\n Inner non-app-error-stack')
      })
    })
  })
})

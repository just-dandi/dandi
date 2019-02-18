import { LogLevel } from '@dandi/core'
import {
  ColorsNotLoadedError,
  initColors,
  PRETTY_COLORS_CONTEXT_TAG,
  PRETTY_COLORS_LEVEL_TAG,
} from '@dandi/logging'

import { expect } from 'chai'

import * as colors from './colors'

describe('PrettyColorsLogging', function() {

  describe('no colors', function() {

    beforeEach(function() {
      expect(colors.__loaded).to.be.true
      this.sandbox.stub(colors, '__loaded').get(() => false)
    })

    it('throws an error when the colors package is not available', function() {
      expect(() => PRETTY_COLORS_CONTEXT_TAG({ level: LogLevel.debug } as any))
        .to.throw(ColorsNotLoadedError)
    })

  })

  describe('with colors', function() {

    beforeEach(function() {
      initColors()
      this.sandbox.stub(colors, 'debug')
    })

    describe('contextTag', function() {

      it('uses the level-themed color for formatting the context tag', function() {

        const entry: any = { level: LogLevel.debug, contextName: 'test' }
        PRETTY_COLORS_CONTEXT_TAG(entry)

        expect(colors['debug']).to.have.been
          .calledOnce
          .calledWith('test')

      })

    })

    describe('levelTag', function() {

      it('uses the level-themed color for formatting the context tag', function() {

        const entry: any = { level: LogLevel.debug }
        PRETTY_COLORS_LEVEL_TAG(entry)

        expect(colors['debug']).to.have.been
          .calledOnce
          .calledWith('DEBUG')

      })

    })

  })

})

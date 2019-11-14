import { stubHarness } from '@dandi/core/testing'
import { MimeTypes } from '@dandi/http'
import { NativeJsonObjectRenderer } from '@dandi/mvc'

import { expect } from 'chai'

describe('NativeJsonObjectRenderer', function() {

  const harness = stubHarness(NativeJsonObjectRenderer)

  beforeEach(async function() {
    this.renderer = await harness.inject(NativeJsonObjectRenderer)
  })

  describe('renderControllerResult', function() {

    it('returns a JSON representation of an object', async function() {
      const controllerResult = {
        data: {
          foo: 'bar',
        },
      }
      const result = await this.renderer.renderControllerResult(MimeTypes.textPlain, controllerResult)

      expect(result).to.equal('{"foo":"bar"}')
    })

    it('returns a JSON representation of a string', async function() {
      const controllerResult = { data: 'foo' }
      const result = await this.renderer.renderControllerResult(MimeTypes.textPlain, controllerResult)

      expect(result).to.equal('"foo"')
    })

    it('returns a JSON representation of a number', async function() {
      const controllerResult = { data: 42 }
      const result = await this.renderer.renderControllerResult(MimeTypes.textPlain, controllerResult)

      expect(result).to.equal('42')
    })

  })

})

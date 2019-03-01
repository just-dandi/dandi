import { isRenderableMimeType, MimeTypes, parseMimeTypes } from '@dandi/mvc'

import { expect } from 'chai'

describe('mime type', function() {

  describe('parseMimeTypes', function() {
    it('parses a basic mime type', function() {
      const result = parseMimeTypes(MimeTypes.textPlain)

      expect(result).to.deep.equal([{
        source: MimeTypes.textPlain,
        type: 'text',
        subtype: 'plain',
        subtypeBase: undefined,
        fullType: MimeTypes.textPlain,
        weight: 1, // defaults to 1 if no q option is specified
      }])
    })

    it('parses multiple types from the same string', function() {

      const result = parseMimeTypes(`${MimeTypes.textPlain},${MimeTypes.textHtml}`)

      expect(result).to.deep.equal([
        {
          source: MimeTypes.textPlain,
          type: 'text',
          subtype: 'plain',
          subtypeBase: undefined,
          fullType: MimeTypes.textPlain,
          weight: 1,
        },
        {
          source: MimeTypes.textHtml,
          type: 'text',
          subtype: 'html',
          subtypeBase: undefined,
          fullType: MimeTypes.textHtml,
          weight: 1,
        },
      ])
    })


    it('parses multiple types from spread args', function() {

      const result = parseMimeTypes(MimeTypes.textPlain, MimeTypes.textHtml)

      expect(result).to.deep.equal([
        {
          source: MimeTypes.textPlain,
          type: 'text',
          subtype: 'plain',
          subtypeBase: undefined,
          fullType: MimeTypes.textPlain,
          weight: 1,
        },
        {
          source: MimeTypes.textHtml,
          type: 'text',
          subtype: 'html',
          subtypeBase: undefined,
          fullType: MimeTypes.textHtml,
          weight: 1,
        },
      ])
    })

    it('parses the base subtype', function() {
      const result = parseMimeTypes(`application/hal+json`)

      expect(result).to.deep.equal([{
        source: 'application/hal+json',
        type: 'application',
        subtype: 'hal+json',
        subtypeBase: 'json',
        fullType: `application/hal+json`,
        weight: 1,
      }])

    })

    it('parses the weight', function() {
      const result = parseMimeTypes(`${MimeTypes.textPlain}; q=0.5`)

      expect(result).to.deep.equal([{
        source: `${MimeTypes.textPlain}; q=0.5`,
        type: 'text',
        subtype: 'plain',
        subtypeBase: undefined,
        fullType: MimeTypes.textPlain,
        weight: 0.5,
      }])
    })

    it('parses the weight with separating space', function() {
      const result = parseMimeTypes(`${MimeTypes.textPlain};q=0.5`)

      expect(result).to.deep.equal([{
        source: `${MimeTypes.textPlain};q=0.5`,
        type: 'text',
        subtype: 'plain',
        subtypeBase: undefined,
        fullType: MimeTypes.textPlain,
        weight: 0.5,
      }])
    })

    it('ignores options other than weight', function() {
      // note: using charset on the Accept header isn't actually allowed by the spec
      const result = parseMimeTypes(`${MimeTypes.textPlain}; charset=utf-8`)

      expect(result).to.deep.equal([{
        source: `${MimeTypes.textPlain}; charset=utf-8`,
        type: 'text',
        subtype: 'plain',
        subtypeBase: undefined,
        fullType: MimeTypes.textPlain,
        weight: 1,
      }])
    })

    it('sorts the result by weight, then by original index', function() {

      const result = parseMimeTypes(MimeTypes.applicationJson, `${MimeTypes.any}; q=0.8`, MimeTypes.textHtml)

      expect(result).to.deep.equal([
        {
          source: MimeTypes.applicationJson,
          type: 'application',
          subtype: 'json',
          subtypeBase: undefined,
          fullType: MimeTypes.applicationJson,
          weight: 1,
        },
        {
          source: MimeTypes.textHtml,
          type: 'text',
          subtype: 'html',
          subtypeBase: undefined,
          fullType: MimeTypes.textHtml,
          weight: 1,
        },
        {
          source: `${MimeTypes.any}; q=0.8`,
          type: '*',
          subtype: '*',
          subtypeBase: undefined,
          fullType: MimeTypes.any,
          weight: 0.8,
        },
      ])

    })

  })

  describe('isRenderableMimeType', function() {

    it('returns true for identical types', function() {

      const accept = parseMimeTypes(MimeTypes.applicationJson)[0]
      const renderable = parseMimeTypes(MimeTypes.applicationJson)[0]

      expect(isRenderableMimeType(accept, renderable)).to.be.true

    })

    it('returns true for a wildcard accept type', function() {

      const accept = parseMimeTypes(MimeTypes.any)[0]
      const renderable = parseMimeTypes(MimeTypes.applicationJson)[0]

      expect(isRenderableMimeType(accept, renderable)).to.be.true

    })

    it('returns true for a wildcard accept subtype', function() {

      const accept = parseMimeTypes(MimeTypes.anyApplication)[0]
      const renderable = parseMimeTypes(MimeTypes.applicationJson)[0]

      expect(isRenderableMimeType(accept, renderable)).to.be.true

    })

    it('returns false for mismatching types', function() {

      const accept = parseMimeTypes(MimeTypes.textPlain)[0]
      const renderable = parseMimeTypes(MimeTypes.applicationJson)[0]

      expect(isRenderableMimeType(accept, renderable)).to.be.false

    })

    it('returns false for mismatching subtypes', function() {

      const accept = parseMimeTypes(MimeTypes.textPlain)[0]
      const renderable = parseMimeTypes(MimeTypes.textHtml)[0]

      expect(isRenderableMimeType(accept, renderable)).to.be.false

    })

    it('returns false for mismatching wildcard subtypes', function() {

      const accept = parseMimeTypes(MimeTypes.anyApplication)[0]
      const renderable = parseMimeTypes(MimeTypes.textHtml)[0]

      expect(isRenderableMimeType(accept, renderable)).to.be.false

    })

  })

})

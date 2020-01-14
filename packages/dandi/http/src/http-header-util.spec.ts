import {
  HttpHeader,
  parseHeader,
  parseHeaders,
  parseMimeTypes,
  parseRawHeader,
  splitRawHeader,
  standardParseHeader,
  standardParseHeaderValue,
} from '@dandi/http'

import { expect } from 'chai'

describe('HTTP Header Utilities', () => {

  describe('splitRawHeader', () => {
    it('returns an object containing the header name and the raw value', () => {
      expect(splitRawHeader('content-type: text/plain')).to.deep.equal({
        name: 'content-type',
        rawValue: 'text/plain',
      })
    })

    it('forces the header name to lowercase to facilitate case-insensitivity', () => {
      expect(splitRawHeader('CoNtEnT-TyPe: text/plain')).to.deep.equal({
        name: 'content-type',
        rawValue: 'text/plain',
      })
    })

    it('includes any directives in the rawValue property', () => {
      expect(splitRawHeader('content-type: text/plain; charset=utf-8')).to.deep.equal({
        name: 'content-type',
        rawValue: 'text/plain; charset=utf-8',
      })
    })
  })

  describe('standardParseHeaderValue', () => {
    it('returns an object containing just the value if no directives are specified', () => {
      expect(standardParseHeaderValue('text/plain')).to.deep.equal({ value: 'text/plain' })
    })

    it('returns an object containing the value and a map of any directives', () => {
      expect(standardParseHeaderValue('text/plain; charset=utf-8')).to.deep.equal({
        value: 'text/plain',
        directives: {
          charset: 'utf-8',
        },
      })
    })

    it('removes double quotes from directive values', () => {
      expect(standardParseHeaderValue('text/plain; charset="utf-8"')).to.deep.equal({
        value: 'text/plain',
        directives: {
          charset: 'utf-8',
        },
      })
    })

    it('parses multiple directives', () => {
      expect(standardParseHeaderValue('text/plain; charset=utf-8; boundary=fooooo')).to.deep.equal({
        value: 'text/plain',
        directives: {
          charset: 'utf-8',
          boundary: 'fooooo',
        },
      })
    })
  })

  describe('standardParseHeader', () => {
    it('sets a key with the HttpHeader key corresponding to the name of the header, which contains the value of the header', () => {
      expect(standardParseHeader(HttpHeader.contentType, 'text/plain')).to.deep.equal({
        contentType: 'text/plain',
      })
    })

    it('sets the keys of any directives as siblings of the value key', () => {
      expect(standardParseHeader(HttpHeader.contentType, 'text/plain; charset=utf-8')).to.deep.equal({
        contentType: 'text/plain',
        charset: 'utf-8',
      })
    })
  })

  describe('parseHeader', () => {
    it('uses the standard parsing functions for headers that do not specify a customized parsing function', () => {
      expect(parseHeader(HttpHeader.contentType, 'text/plain; charset=utf-8')).to.deep.equal({
        contentType: 'text/plain',
        charset: 'utf-8',
      })
    })

    it('uses the configured custom parsing function to parse the header value, if present', () => {
      expect(parseHeader(HttpHeader.accept, 'text/plain')).to.deep.equal(parseMimeTypes('text/plain'))
    })
  })

  describe('parseRawHeader', () => {
    it('returns a ParsedHeader object containing the name of the header and the header-specific object presenting the value', () => {
      expect(parseRawHeader(splitRawHeader('content-type: text/plain'))).to.deep.equal({
        name: 'content-type',
        value: {
          contentType: 'text/plain',
        },
      })
    })
  })

  describe('parseHeaders', () => {
    it('returns an object containing the headers and their header-specific object values', () => {
      expect(parseHeaders([
        'accept: text/plain',
        'content-type: text/plain; charset=utf-8',
      ])).to.deep.equal({
        'accept': parseMimeTypes('text/plain'),
        'content-type': {
          contentType: 'text/plain',
          charset: 'utf-8',
        },
      })
    })
  })

})

import { expect } from 'chai'

import { SymbolToken } from './symbol-token'

describe('SymbolToken', () => {
  describe('local', () => {
    it('creates a SymbolToken for the specified package and target', () => {
      const token = SymbolToken.local('test-pkg', 'test')
      expect(token).to.be.instanceOf(SymbolToken)
      expect((token as any).desc).to.equal('test-pkg#test')
    })

    it('creates unique SymbolToken instances each time it is called, even with the same arguments', () => {
      const token1 = SymbolToken.local('test-pkg', 'test')
      expect((token1 as any).desc).to.equal('test-pkg#test')
      const token2 = SymbolToken.local('test-pkg', 'test')
      expect((token1 as any).desc).to.equal('test-pkg#test')
      expect(token1).not.to.equal(token2)
    })
  })

  describe('forLocal', () => {
    it('creates a SymbolToken for the specified package and target', () => {
      const token = SymbolToken.forLocal('test-pkg', 'test')
      expect((token as any).desc).to.equal('test-pkg#test')
      expect(token).to.be.instanceOf(SymbolToken)
    })

    it('reuses the same SymbolToken instances each time it is called with the same arguments', () => {
      const token1 = SymbolToken.forLocal('test-pkg', 'test')
      const token2 = SymbolToken.forLocal('test-pkg', 'test')
      expect((token1 as any).desc).to.equal('test-pkg#test')
      expect(token1).to.equal(token2)
    })
  })

  describe('for', () => {
    it('creates a SymbolToken for the specified package and target', () => {
      const token = SymbolToken.for('test')
      expect((token as any).desc).to.equal('test')
      expect(token).to.be.instanceOf(SymbolToken)
    })

    it('reuses the same SymbolToken instances each time it is called with the same arguments', () => {
      const token1 = SymbolToken.for('test')
      const token2 = SymbolToken.for('test')
      expect((token1 as any).desc).to.equal('test')
      expect(token1).to.equal(token2)
    })
  })

  describe('ctr', () => {
    it('prevents any modifications from being made to the instance', () => {
      const token = SymbolToken.for('test')
      expect(() => ((token as any).desc = 'foo')).to.throw
      expect((token as any).desc).to.equal('test')
    })
  })

  describe('toString', () => {
    it('returns "SymbolToken[desc]"', () => {
      const token = SymbolToken.for('test')
      expect(token.toString()).to.equal('SymbolToken[test]')
    })
  })
})

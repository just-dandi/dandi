import { expect } from 'chai';

import { isInjectionToken, SymbolToken } from '../';

class TestClass {}

describe('SymbolToken', () => {
  describe('ctr', () => {
    it('creates new internal Symbols for each instantiation', () => {
      const s1 = new SymbolToken('test');
      const s2 = new SymbolToken('test');

      expect(s1).not.to.equal(s2);
      expect(s1.valueOf()).not.to.equal(s2.valueOf());
    });
  });

  describe('toString', () => {
    it('returns a string including the description specified in the constructor', () => {
      expect(new SymbolToken('test').toString()).to.equal('SymbolToken[test]');
    });
  });
});

describe('isInjectionToken', () => {
  it('returns false for false-y values', () => {
    expect(isInjectionToken(null)).to.be.false;
    expect(isInjectionToken(undefined)).to.be.false;
    expect(isInjectionToken('')).to.be.false;
    expect(isInjectionToken(0)).to.be.false;
    expect(isInjectionToken(false)).to.be.false;
    expect(isInjectionToken(NaN)).to.be.false;
  });

  it('returns false for non-SymbolToken objects', () => {
    expect(isInjectionToken({})).to.be.false;
    expect(isInjectionToken(Symbol('foo'))).to.be.false;
  });

  it('returns true for classes', () => {
    expect(isInjectionToken(TestClass)).to.be.true;
  });

  it('returns true for constructable functions', () => {
    expect(isInjectionToken(function() {})).to.be.true;
  });

  it('returns true for SymbolToken instances', () => {
    expect(isInjectionToken(new SymbolToken('test'))).to.be.true;
  });

  it('returns false for non-constructable functions', () => {
    expect(isInjectionToken(() => {})).to.be.false;
  });

  it('returns true for mapped injection tokens', () => {
    class TestClass {}
    expect(
      isInjectionToken({
        provide: TestClass,
        key: 'foo',
      }),
    ).to.be.true;
  });
});

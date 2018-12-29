import { expect } from 'chai'

import { isClassProvider, isFactoryProvider, isGeneratingProvider, isProvider, isValueProvider } from './provider.util'

class TestClass {}

describe('isClassProvider', () => {
  it('returns true when useClass is a class', () => {
    expect(isClassProvider({ provide: TestClass, useClass: TestClass })).to.be.true
  })

  it('returns true when useClass is a constructable function', () => {
    expect(isClassProvider({ provide: TestClass, useClass: function() {} })).to.be.true
  })

  it('returns false when useClass is a non-constructable function', () => {
    expect(isClassProvider({ provide: TestClass, useClass: () => {} })).to.be.false
  })

  it('returns false when provide is missing', () => {
    expect(isClassProvider({ useClass: TestClass })).to.be.false
  })

  it('returns false when useClass is missing', () => {
    expect(isClassProvider({ provide: TestClass })).to.be.false
  })

  it('returns false when useClass is not a function', () => {
    expect(isClassProvider({ provide: TestClass, useClass: {} })).to.be.false
    expect(isClassProvider({ provide: TestClass, useClass: 'foo' })).to.be.false
    expect(isClassProvider({ provide: TestClass, useClass: null })).to.be.false
    expect(isClassProvider({ provide: TestClass, useClass: undefined })).to.be.false
    expect(isClassProvider({ provide: TestClass, useClass: 1 })).to.be.false
  })
})

describe('isFactoryProvider', () => {
  it('returns true when useFactory is a function', () => {
    expect(isFactoryProvider({ provide: TestClass, useFactory: TestClass })).to.be.true
    expect(isFactoryProvider({ provide: TestClass, useFactory() {} })).to.be.true
    expect(isFactoryProvider({ provide: TestClass, useFactory: () => {} })).to.be.true
  })

  it('returns false when provide is missing', () => {
    expect(isFactoryProvider({ useFactory: TestClass })).to.be.false
  })

  it('returns false when useFactory is missing', () => {
    expect(isFactoryProvider({ provide: TestClass })).to.be.false
  })

  it('returns false when useFunction is not a function', () => {
    expect(isFactoryProvider({ provide: TestClass, useFactory: {} })).to.be.false
    expect(isFactoryProvider({ provide: TestClass, useFactory: 'foo' })).to.be.false
    expect(isFactoryProvider({ provide: TestClass, useFactory: null })).to.be.false
    expect(isFactoryProvider({ provide: TestClass, useFactory: undefined })).to.be.false
    expect(isFactoryProvider({ provide: TestClass, useFactory: 1 })).to.be.false
  })
})

describe('isGeneratingProvider', () => {
  it('returns true when the provider is a valid ClassProvider', () => {
    expect(isGeneratingProvider({ provide: TestClass, useClass: TestClass })).to.be.true
  })

  it('returns true when the provider is a valid FactoryProvider', () => {
    expect(isGeneratingProvider({ provide: TestClass, useFactory: () => {} })).to.be.true
  })

  it('returns false when the provider is a ValueProvider', () => {
    expect(isGeneratingProvider({ provide: TestClass, useValue: {} })).to.be.false
  })

  it('returns false if the provider is not a valid provider', () => {
    expect(isGeneratingProvider({ useClass: TestClass })).to.be.false
    expect(isGeneratingProvider({ useFactory: () => {} })).to.be.false
  })
})

describe('isValueProvider', () => {
  it('returns true when useValue is defined and not null', () => {
    expect(isValueProvider({ provide: TestClass, useValue: {} })).to.be.true
    expect(isValueProvider({ provide: TestClass, useValue: '' })).to.be.true
    expect(isValueProvider({ provide: TestClass, useValue: 'test' })).to.be.true
    expect(isValueProvider({ provide: TestClass, useValue: 1 })).to.be.true
    expect(isValueProvider({ provide: TestClass, useValue: () => {} })).to.be.true
  })

  it('returns false when provide is missing', () => {
    expect(isValueProvider({ useValue: {} })).to.be.false
  })

  it('returns false when useValue is missing', () => {
    expect(isValueProvider({ provide: TestClass })).to.be.false
  })
})

describe('isProvider', () => {
  it('returns false if the provide property is missing', () => {
    expect(isProvider({ useValue: {} })).to.be.false
  })

  it('returns false if the provide property is not an injection token', () => {
    expect(isProvider({ provide: {}, useValue: {} })).to.be.false
  })

  it('returns false if the provide property is a valid injection token, but does not have any valid provider properties', () => {
    expect(isProvider({ provide: TestClass })).to.be.false
  })

  it('returns true for ClassProviders', () => {
    expect(isProvider({ provide: TestClass, useClass: TestClass })).to.be.true
  })

  it('returns true for FactoryProviders', () => {
    expect(isProvider({ provide: TestClass, useFactory: () => new TestClass() })).to.be.true
  })

  it('returns true for ValueProviders', () => {
    expect(isProvider({ provide: TestClass, useValue: {} })).to.be.true
  })
})

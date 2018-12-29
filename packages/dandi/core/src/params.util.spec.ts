import { expect } from 'chai'

import { UnsupportedParamTypeError, getParamNames } from './params.util'

describe('getParamNames', () => {
  class ImplicitConstructorTestClass {}

  class ParameterlessConstructorTestClass {
    constructor() {}
  }

  class SingleParameterTestClass {
    constructor(param: any) {}
  }

  class SingleRestParameterTestClass {
    constructor(...params: any[]) {}
  }

  class DoubleParameterTestClass {
    constructor(param1: any, param2: any) {}
  }

  class DoubleRestParameterTestClass {
    constructor(param1: any, ...params: any[]) {}
  }

  class MultiParameterTestClass {
    constructor(param1: any, param2: any, param3: any) {}
  }

  class MultiRestParameterTestClass {
    constructor(param1: any, param2: any, ...params: any[]) {}
  }

  class TestClass {
    public noParams(): void {
      console.log('noParams')
    }

    public singleParam(param: any): void {}
    public doubleParam(param1: any, param2: any): void {}
    public multiParam(param1: any, param2: any, param3: any) {}
  }

  function parameterlessFunction(): void {}
  function singleParameterFunction(param: any): void {}
  function doubleParameterFunction(param1: any, param2): void {}
  function multiParameterFunction(param1: any, param2: any, param3: any): void {}

  const parameterlessArrowFunction = (): void => {}
  const singleParameterArrowFunction = (param): void => {}
  const singleParameterParensArrowFunction = (param: any): void => {}
  const doubleParameterArrowFunction = (param1: any, param2: any): void => {}
  const multiParameterArrowFunction = (param1: any, param2: any, param3: any): void => {}

  const parameterlessAnonFunction = function(): void {}
  const singleParameterAnonFunction = function(param: any): void {}
  const doubleParameterAnonFunction = function(param1: any, param2: any): void {}
  const multiParameterAnonFunction = function(param1: any, param2: any, param3: any): void {}

  it('throws an error if the specified target is not a function', () => {
    expect(() => getParamNames({} as any)).to.throw
  })

  it('returns an empty array for an implicit parameterless constructor', () => {
    expect(getParamNames(ImplicitConstructorTestClass)).to.be.empty
  })

  it('returns an empty array for an explicit parameterless constructor', () => {
    expect(getParamNames(ParameterlessConstructorTestClass)).to.be.empty
  })

  it('returns the array of parameter names for a single parameter constructor', () => {
    expect(getParamNames(SingleParameterTestClass)).to.deep.equal(['param'])
  })

  it('returns the array of parameter names for a rest params constructor', () => {
    expect(() => getParamNames(SingleRestParameterTestClass)).to.throw(UnsupportedParamTypeError)
  })

  it('returns the array of parameter names for a double parameter constructor', () => {
    expect(getParamNames(DoubleParameterTestClass)).to.deep.equal(['param1', 'param2'])
  })

  it('returns the array of parameter names for a double rest params constructor', () => {
    expect(() => getParamNames(DoubleRestParameterTestClass)).to.throw(UnsupportedParamTypeError)
  })

  it('returns the array of parameter names for a multiple parameter constructor', () => {
    expect(getParamNames(MultiParameterTestClass)).to.deep.equal(['param1', 'param2', 'param3'])
  })

  it('returns the array of parameter names for a multi rest params constructor', () => {
    expect(() => getParamNames(MultiRestParameterTestClass)).to.throw(UnsupportedParamTypeError)
  })

  it('returns the array of parameter names for a parameterless method', () => {
    expect(getParamNames(TestClass.prototype.noParams, 'noParams')).to.be.empty
  })

  it('returns the array of parameter names for a single parameter method', () => {
    expect(getParamNames(TestClass.prototype.singleParam, 'singleParam')).to.deep.equal(['param'])
  })

  it('returns the array of parameter names for a double parameter method', () => {
    expect(getParamNames(TestClass.prototype.doubleParam, 'doubleParam')).to.deep.equal(['param1', 'param2'])
  })

  it('returns the array of parameter names for a multi parameter method', () => {
    expect(getParamNames(TestClass.prototype.multiParam, 'multiParam')).to.deep.equal(['param1', 'param2', 'param3'])
  })

  it('returns an empty array for a parameterless function', () => {
    expect(getParamNames(parameterlessFunction)).to.be.empty
  })

  it('returns an array of parameter names for a single parameter function', () => {
    expect(getParamNames(singleParameterFunction)).to.deep.equal(['param'])
  })

  it('returns an array of parameter names for a double parameter function', () => {
    expect(getParamNames(doubleParameterFunction)).to.deep.equal(['param1', 'param2'])
  })

  it('returns an array of parameter names for a multi parameter function', () => {
    expect(getParamNames(multiParameterFunction)).to.deep.equal(['param1', 'param2', 'param3'])
  })

  it('returns an empty array for a parameterless arrow function', () => {
    expect(getParamNames(parameterlessArrowFunction)).to.be.empty
  })

  it('returns an array of parameter names for a single parameter function', () => {
    expect(getParamNames(singleParameterArrowFunction)).to.deep.equal(['param'])
  })

  it('returns an array of parameter names for a single parameter function with parens', () => {
    expect(getParamNames(singleParameterParensArrowFunction)).to.deep.equal(['param'])
  })

  it('returns an array of parameter names for a double parameter function', () => {
    expect(getParamNames(doubleParameterArrowFunction)).to.deep.equal(['param1', 'param2'])
  })

  it('returns an array of parameter names for a multi parameter function', () => {
    expect(getParamNames(multiParameterArrowFunction)).to.deep.equal(['param1', 'param2', 'param3'])
  })

  it('returns an empty array for a parameterless anonymous function', () => {
    expect(getParamNames(parameterlessAnonFunction)).to.be.empty
  })

  it('returns an array of parameter names for a single parameter anonymous function', () => {
    expect(getParamNames(singleParameterAnonFunction)).to.deep.equal(['param'])
  })

  it('returns an array of parameter names for a double parameter anonymous function', () => {
    expect(getParamNames(doubleParameterAnonFunction)).to.deep.equal(['param1', 'param2'])
  })

  it('returns an array of parameter names for a multi parameter anonymous function', () => {
    expect(getParamNames(multiParameterAnonFunction)).to.deep.equal(['param1', 'param2', 'param3'])
  })
})

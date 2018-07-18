import { Injectable, InjectionTokenTypeError, Multi, Repository, Singleton } from '../';

import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

describe('@Injectable', () => {

    let register: SinonSpy;
    beforeEach(() => {
        register = spy(Repository.global, 'register');
    });
    afterEach(() => {
        register.restore();
        register = undefined;
    });

    it('registers the decorated class with the global repository', () => {

        class TestClass {}

        Injectable()(TestClass);

        expect(register).to.have.been.calledOnce;
        expect(register).to.have.been.calledWith(TestClass, {});

    });

    it('registers the decorated class for the specified token', () => {

        class FooClass {
            bar: string;
        }
        class TestClass {}

        Injectable(FooClass)(TestClass);

        expect(register).to.have.been.calledOnce;
        expect(register).to.have.been.calledWith(TestClass, { provide: FooClass });

    });

    it('throws if the specified token is not a valid InjectionToken', () => {

        class TestClass {}

        expect(() => Injectable({} as any)(TestClass)).to.throw(InjectionTokenTypeError);

    });

    it('sets any specified options', () => {

        class TestClass {}

        Injectable(Singleton, Multi)(TestClass);

        expect(register).to.have.been.calledOnce;
        expect(register).to.have.been.calledWith(TestClass, { multi: true, singleton: true });

    });

});

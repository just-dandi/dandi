import { Repository } from '@dandi/core';
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import { Controller, MissingControllerPathError } from '../';

import { getControllerMetadata } from './controller.metadata';

// tslint:disable no-unused-expression no-empty max-classes-per-file
describe('@Controller', () => {

    let injectableRegister: SinonSpy;
    let controllerRegister: SinonSpy;
    beforeEach(() => {
        injectableRegister = spy(Repository.global, 'register');
        controllerRegister = spy(Repository.for(Controller), 'register');
    });
    afterEach(() => {
        injectableRegister.restore();
        injectableRegister = undefined;
        controllerRegister.restore();
        controllerRegister = undefined;
    });

    it('registers the class as an Injectable', () => {

        class TestClass {}

        Controller('/test')(TestClass);

        expect(injectableRegister).to.have.been.calledOnce;
        expect(injectableRegister).to.have.been.calledWith(TestClass, {});

    });

    it('registers the class in the Controller repository', () => {

        class TestClass {}

        Controller('/test')(TestClass);

        expect(controllerRegister).to.have.been.calledOnce;
        expect(controllerRegister).to.have.been.calledWith(TestClass);

    });

    it('sets the path on the controller metadata', () => {

        class TestClass {}
        class TestClassOptions {}

        Controller('/test')(TestClass);
        Controller({ path: '/test' })(TestClassOptions);

        expect(getControllerMetadata(TestClass).path).to.equal('/test');
        expect(getControllerMetadata(TestClassOptions).path).to.equal('/test');

    });

    it('throws an error if the path is null or undefined', () => {

        class TestClass {}

        expect(() => Controller(null)(TestClass)).to.throw(MissingControllerPathError);
        expect(() => Controller(undefined)(TestClass)).to.throw(MissingControllerPathError);
        expect(() => Controller({ path: null })(TestClass)).to.throw(MissingControllerPathError);
        expect(() => Controller({ path: undefined })(TestClass)).to.throw(MissingControllerPathError);

    });

});

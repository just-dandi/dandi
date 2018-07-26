import { TypeValidator } from '@dandi/model-validation';

import { expect } from 'chai';
import { SinonStubbedInstance, stub } from 'sinon';

import { requestParamValidatorFactory } from './request.param.validator';

// tslint:disable unused-expression no-empty
describe('requestParamValidatorFactory', () => {

    let paramMap: { [key: string]: string };
    let validator: SinonStubbedInstance<TypeValidator<any>>;

    function makeValidator(): SinonStubbedInstance<TypeValidator<any>> {
        return stub({
            validate: () => {},
        });
    }

    beforeEach(() => {
        paramMap = { foo: 'bar' };
        validator = makeValidator();
    });
    afterEach(() => {
        paramMap = undefined;
        validator = undefined;
    });

    it('calls validators with the value from the param map specified by the key', () => {

        requestParamValidatorFactory(String, 'foo', null, paramMap, validator);

        expect(validator.validate).to.have.been.calledOnce.calledWith('bar');

    });

});
